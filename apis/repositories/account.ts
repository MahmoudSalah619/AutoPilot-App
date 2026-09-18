import dayjs from 'dayjs';

import { TABLES, USE_MOCK_DATA } from '@/apis/config';
import { supabase } from '@/apis/supabaseClient';
import { db, delay, mockId } from '@/apis/mock/store';
import type { AppNotification, UserPreferences, UserProfile } from '@/@types/models';
import { RepositoryError, toRow, unwrap } from './helpers';

/* ── Auth ─────────────────────────────────────────────────────────────────── */

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
  if (USE_MOCK_DATA) {
    if (!email || !password) throw new RepositoryError('auth.errors.missingCredentials', 400);
    return delay({ userId: db.profile.id, email, accessToken: 'mock-access-token' }, 500);
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new RepositoryError(error.message, error.status ?? 401);

  return {
    userId: data.user?.id ?? '',
    email: data.user?.email ?? email,
    accessToken: data.session?.access_token,
  };
}

export async function signUp(payload: SignUpPayload): Promise<Session> {
  if (USE_MOCK_DATA) {
    db.profile = {
      ...db.profile,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
    };

    return delay(
      { userId: db.profile.id, email: payload.email, accessToken: 'mock-access-token' },
      600
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: { first_name: payload.firstName, last_name: payload.lastName },
    },
  });

  if (error) throw new RepositoryError(error.message, error.status ?? 400);

  return {
    userId: data.user?.id ?? '',
    email: data.user?.email ?? payload.email,
    accessToken: data.session?.access_token,
  };
}

export async function signOut(): Promise<void> {
  if (USE_MOCK_DATA) {
    await delay(null, 200);
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw new RepositoryError(error.message);
}

export async function getSession(): Promise<Session | null> {
  if (USE_MOCK_DATA) {
    return delay(null, 100);
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) throw new RepositoryError(error.message);
  if (!data.session) return null;

  return {
    userId: data.session.user.id,
    email: data.session.user.email ?? '',
    accessToken: data.session.access_token,
  };
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await delay(null, 500);
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new RepositoryError(error.message);
}

/* ── Profile ──────────────────────────────────────────────────────────────── */

export async function getProfile(): Promise<UserProfile> {
  if (USE_MOCK_DATA) {
    return delay(db.profile);
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new RepositoryError('Not authenticated', 401);

  return unwrap<UserProfile>(
    await supabase.from(TABLES.profiles).select('*').eq('id', auth.user.id).single()
  );
}

export async function updateProfile(patch: Partial<UserProfile>): Promise<UserProfile> {
  if (USE_MOCK_DATA) {
    db.profile = { ...db.profile, ...patch };
    return delay(db.profile);
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new RepositoryError('Not authenticated', 401);

  return unwrap<UserProfile>(
    await supabase
      .from(TABLES.profiles)
      .update(toRow(patch))
      .eq('id', auth.user.id)
      .select()
      .single()
  );
}

/* ── Preferences ──────────────────────────────────────────────────────────── */

export async function getPreferences(): Promise<UserPreferences> {
  if (USE_MOCK_DATA) {
    return delay(db.preferences);
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new RepositoryError('Not authenticated', 401);

  const profile = unwrap<{ preferences: UserPreferences }>(
    await supabase.from(TABLES.profiles).select('preferences').eq('id', auth.user.id).single()
  );

  return profile.preferences;
}

export async function updatePreferences(patch: Partial<UserPreferences>): Promise<UserPreferences> {
  if (USE_MOCK_DATA) {
    db.preferences = { ...db.preferences, ...patch };
    return delay(db.preferences);
  }

  const current = await getPreferences();
  const next = { ...current, ...patch };

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new RepositoryError('Not authenticated', 401);

  const { error } = await supabase
    .from(TABLES.profiles)
    .update({ preferences: next })
    .eq('id', auth.user.id);

  if (error) throw new RepositoryError(error.message);

  return next;
}

/* ── Notifications ────────────────────────────────────────────────────────── */

export async function listNotifications(): Promise<AppNotification[]> {
  if (USE_MOCK_DATA) {
    return delay(
      [...db.notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  }

  return unwrap<AppNotification[]>(
    await supabase.from(TABLES.notifications).select('*').order('created_at', { ascending: false })
  );
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  if (USE_MOCK_DATA) {
    const found = db.notifications.find((notification) => notification.id === id);
    if (!found) throw new RepositoryError('Notification not found', 404);

    found.isRead = true;
    return delay(found, 120);
  }

  return unwrap<AppNotification>(
    await supabase
      .from(TABLES.notifications)
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single()
  );
}

export async function markAllNotificationsRead(): Promise<AppNotification[]> {
  if (USE_MOCK_DATA) {
    db.notifications.forEach((notification) => {
      notification.isRead = true;
    });

    return delay(db.notifications, 200);
  }

  return unwrap<AppNotification[]>(
    await supabase
      .from(TABLES.notifications)
      .update({ is_read: true })
      .eq('is_read', false)
      .select()
  );
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

  if (USE_MOCK_DATA) {
    db.notifications.unshift(record);
    return delay(record, 100);
  }

  return unwrap<AppNotification>(
    await supabase.from(TABLES.notifications).insert(toRow(record)).select().single()
  );
}
