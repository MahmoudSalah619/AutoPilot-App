import dayjs from 'dayjs';

import { AUTH_REDIRECTS, isLive } from '@/apis/config';
import { supabase } from '@/apis/supabaseClient';
import { db, delay, mockId } from '@/apis/mock/store';
import type { AppNotification, UserPreferences, UserProfile } from '@/@types/models';
import { RepositoryError } from './helpers';
import { resetReferenceCache } from './reference';

/* ── Auth ─────────────────────────────────────────────────────────────────── */

/**
 * GoTrue error codes mapped to translation keys.
 *
 * Supabase's raw strings are written for developers — "over_email_send_rate_
 * limit" surfaces to the user as "email rate limit exceeded", which says
 * nothing about what they should do next. Screens pass whatever comes back
 * to `t()` with the message as its own fallback, so anything unmapped still
 * shows, just untranslated.
 */
const AUTH_ERROR_KEYS: Record<string, string> = {
  invalid_credentials: 'auth.errors.invalidCredentials',
  email_address_invalid: 'validation.invalidEmail',
  email_exists: 'auth.errors.emailInUse',
  user_already_exists: 'auth.errors.emailInUse',
  email_not_confirmed: 'auth.errors.emailNotConfirmed',
  weak_password: 'validation.passwordTooShort',
  same_password: 'auth.errors.samePassword',
  over_email_send_rate_limit: 'auth.errors.tooManyEmails',
  over_request_rate_limit: 'auth.errors.tooManyRequests',
  session_expired: 'auth.errors.notAuthenticated',
  flow_state_expired: 'auth.errors.linkExpired',
  flow_state_not_found: 'auth.errors.linkExpired',
  otp_expired: 'auth.errors.linkExpired',
  signup_disabled: 'auth.errors.signupDisabled',
};

/** Shape of what `supabase.auth` rejects with, narrowed to what is used. */
interface AuthLikeError {
  message: string;
  status?: number;
  code?: string;
}

/**
 * Turns a Supabase auth error into one the UI can show.
 *
 * Matches on `code` rather than the message: the codes are a stable contract,
 * the prose is not.
 */
function authError(error: AuthLikeError, fallbackStatus: number): RepositoryError {
  const key = error.code ? AUTH_ERROR_KEYS[error.code] : undefined;

  return new RepositoryError(key ?? error.message, error.status ?? fallbackStatus);
}

export interface Credentials {
  email: string;
  password: string;
}

export interface SignUpPayload extends Credentials {
  firstName: string;
  lastName: string;
}

export interface Session {
  userId: string;
  email: string;
  accessToken?: string;
}

export async function signIn({ email, password }: Credentials): Promise<Session> {
  if (!isLive('auth')) {
    if (!email || !password) throw new RepositoryError('auth.errors.missingCredentials', 400);
    return delay({ userId: db.profile.id, email, accessToken: 'mock-access-token' }, 500);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw authError(error, 401);

  return {
    userId: data.user?.id ?? '',
    email: data.user?.email ?? email,
    accessToken: data.session?.access_token,
  };
}

/**
 * Result of a sign-up.
 *
 * With email confirmation enabled Supabase returns a user but no session, and
 * the caller has to route somewhere else in that case — so the distinction is
 * part of the return type rather than something screens have to infer from a
 * missing token.
 */
export interface SignUpResult extends Session {
  isPendingConfirmation: boolean;
}

/**
 * Creates an account.
 *
 * The project has no `profiles` table, so the user's name goes into auth
 * metadata here at sign-up rather than into a row inserted afterwards.
 */
export async function signUp(payload: SignUpPayload): Promise<SignUpResult> {
  if (!isLive('auth')) {
    db.profile = {
      ...db.profile,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
    };

    return delay(
      {
        userId: db.profile.id,
        email: payload.email,
        accessToken: 'mock-access-token',
        isPendingConfirmation: false,
      },
      600
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email: payload.email.trim(),
    password: payload.password,
    options: {
      emailRedirectTo: AUTH_REDIRECTS.confirm,
      data: {
        first_name: payload.firstName.trim(),
        last_name: payload.lastName.trim(),
      },
    },
  });

  if (error) throw authError(error, 400);

  return {
    userId: data.user?.id ?? '',
    email: data.user?.email ?? payload.email,
    accessToken: data.session?.access_token,
    isPendingConfirmation: Boolean(data.user) && !data.session,
  };
}

export async function signOut(): Promise<void> {
  resetReferenceCache();

  if (!isLive('auth')) {
    await delay(null, 200);
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw authError(error, 500);
}

export async function getSession(): Promise<Session | null> {
  if (!isLive('auth')) {
    return delay(null, 100);
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) throw authError(error, 401);
  if (!data.session) return null;

  return {
    userId: data.session.user.id,
    email: data.session.user.email ?? '',
    accessToken: data.session.access_token,
  };
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (!isLive('auth')) {
    await delay(null, 500);
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: AUTH_REDIRECTS.recovery,
  });

  if (error) throw authError(error, 400);
}

/**
 * Trades the `code` from an email deep link for a session.
 *
 * Under PKCE the verifier is already in storage from the request that sent
 * the email, so this only works on the device that asked — which is the
 * point. Opening the link on another phone fails, rather than handing that
 * phone an account.
 */
export async function exchangeAuthCode(code: string): Promise<Session> {
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw authError(error, 400);
  if (!data.session) throw new RepositoryError('auth.errors.linkExpired', 401);

  return {
    userId: data.session.user.id,
    email: data.session.user.email ?? '',
    accessToken: data.session.access_token,
  };
}

/**
 * Sets a new password for the signed-in user.
 *
 * Used by the recovery screen, where the deep link has already established a
 * short-lived session, and by a password change from settings.
 */
export async function updatePassword(password: string): Promise<void> {
  if (!isLive('auth')) {
    await delay(null, 400);
    return;
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw authError(error, 400);
}

/** The signed-in user's id, or a thrown 401. Used by every owned-table write. */
export async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw authError(error, 401);
  if (!data.user) throw new RepositoryError('auth.errors.notAuthenticated', 401);

  return data.user.id;
}

/* ── Profile ──────────────────────────────────────────────────────────────── */

/**
 * Profile fields carried in `auth.users.user_metadata`.
 *
 * There is no `profiles` table in the project, and auth metadata is the one
 * per-user store the client can write without a schema change. It is not a
 * substitute for a real table — it cannot be queried, joined or read by
 * another user — but it keeps the profile screen honest instead of showing
 * seed data.
 */
interface ProfileMetadata {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  address?: string;
  preferences?: UserPreferences;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  distanceUnit: 'km',
  volumeUnit: 'liter',
  currency: 'EGP',
  reminderLeadDays: 7,
};

async function readMetadata(): Promise<{
  id: string;
  email: string;
  createdAt: string;
  metadata: ProfileMetadata;
}> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw authError(error, 401);
  if (!data.user) throw new RepositoryError('auth.errors.notAuthenticated', 401);

  return {
    id: data.user.id,
    email: data.user.email ?? '',
    createdAt: data.user.created_at ?? dayjs().toISOString(),
    metadata: (data.user.user_metadata ?? {}) as ProfileMetadata,
  };
}

async function writeMetadata(patch: ProfileMetadata): Promise<ProfileMetadata> {
  const { metadata } = await readMetadata();
  const next = { ...metadata, ...patch };

  const { error } = await supabase.auth.updateUser({ data: next });
  if (error) throw authError(error, 400);

  return next;
}

export async function getProfile(): Promise<UserProfile> {
  if (!isLive('profile')) {
    return delay(db.profile);
  }

  const { id, email, createdAt, metadata } = await readMetadata();

  return {
    id,
    email,
    createdAt,
    firstName: metadata.first_name ?? '',
    lastName: metadata.last_name ?? '',
    phone: metadata.phone,
    avatarUrl: metadata.avatar_url,
    dateOfBirth: metadata.date_of_birth,
    address: metadata.address,
  };
}

export async function updateProfile(patch: Partial<UserProfile>): Promise<UserProfile> {
  if (!isLive('profile')) {
    db.profile = { ...db.profile, ...patch };
    return delay(db.profile);
  }

  await writeMetadata({
    ...(patch.firstName !== undefined && { first_name: patch.firstName }),
    ...(patch.lastName !== undefined && { last_name: patch.lastName }),
    ...(patch.phone !== undefined && { phone: patch.phone }),
    ...(patch.avatarUrl !== undefined && { avatar_url: patch.avatarUrl }),
    ...(patch.dateOfBirth !== undefined && { date_of_birth: patch.dateOfBirth }),
    ...(patch.address !== undefined && { address: patch.address }),
  });

  return getProfile();
}

/* ── Preferences ──────────────────────────────────────────────────────────── */

export async function getPreferences(): Promise<UserPreferences> {
  if (!isLive('profile')) {
    return delay(db.preferences);
  }

  const { metadata } = await readMetadata();
  return { ...DEFAULT_PREFERENCES, ...metadata.preferences };
}

export async function updatePreferences(patch: Partial<UserPreferences>): Promise<UserPreferences> {
  if (!isLive('profile')) {
    db.preferences = { ...db.preferences, ...patch };
    return delay(db.preferences);
  }

  const current = await getPreferences();
  const next = { ...current, ...patch };

  await writeMetadata({ preferences: next });

  return next;
}

/* ── Notifications ────────────────────────────────────────────────────────── */

/**
 * Notifications have no table in the project, so they stay in the mock store
 * regardless of the backend flag — see `apis/migrations/001_app_gap.sql`.
 * They live for the session only, which is why nothing here consults
 * `isLive`.
 */
export async function listNotifications(): Promise<AppNotification[]> {
  return delay(
    [...db.notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  const found = db.notifications.find((notification) => notification.id === id);
  if (!found) throw new RepositoryError('Notification not found', 404);

  found.isRead = true;
  return delay(found, 120);
}

export async function markAllNotificationsRead(): Promise<AppNotification[]> {
  db.notifications.forEach((notification) => {
    notification.isRead = true;
  });

  return delay(db.notifications, 200);
}

/** Creates a local notification record. Used when a reminder is scheduled. */
export async function pushNotification(
  notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>
): Promise<AppNotification> {
  const record: AppNotification = {
    ...notification,
    id: mockId('ntf'),
    isRead: false,
    createdAt: dayjs().toISOString(),
  };

  db.notifications.unshift(record);
  return delay(record, 100);
}
