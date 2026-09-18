import type { RegisterOptions } from 'react-hook-form';

/**
 * Shared react-hook-form rules.
 *
 * Messages are translation keys — `Input` resolves them, so the same rule set
 * works in both languages without the screens knowing about it.
 */

/** Deliberately permissive; the authoritative check is the confirmation email. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const EMAIL_RULES: RegisterOptions<any, string> = {
  pattern: { value: EMAIL_PATTERN, message: 'validation.invalidEmail' },
};

export const PASSWORD_RULES: RegisterOptions<any, string> = {
  minLength: { value: 8, message: 'validation.passwordTooShort' },
};

/** Stricter rules, used on sign-up where the password is being chosen. */
export const NEW_PASSWORD_RULES: RegisterOptions<any, string> = {
  minLength: { value: 8, message: 'validation.passwordTooShort' },
  validate: {
    hasUppercase: (value: string) => /[A-Z]/.test(value) || 'validation.passwordNeedsUppercase',
    hasLowercase: (value: string) => /[a-z]/.test(value) || 'validation.passwordNeedsLowercase',
    hasNumber: (value: string) => /\d/.test(value) || 'validation.passwordNeedsNumber',
  },
};

export const REQUIRED_NUMBER_RULES: RegisterOptions<any, string> = {
  validate: (value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 'validation.mustBeNumber';
    if (parsed <= 0) return 'validation.mustBePositive';
    return true;
  },
};

export const OPTIONAL_NUMBER_RULES: RegisterOptions<any, string> = {
  validate: (value: string) => {
    if (value === '' || value == null) return true;
    return Number.isFinite(Number(value)) || 'validation.mustBeNumber';
  },
};

export const YEAR_RULES: RegisterOptions<any, string> = {
  validate: (value: string) => {
    const year = Number(value);
    const maxYear = new Date().getFullYear() + 1;

    if (!Number.isInteger(year)) return 'validation.mustBeNumber';
    if (year < 1950 || year > maxYear) return 'validation.invalidYear';

    return true;
  },
};

/** Matches `YYYY-MM-DD` and rejects impossible calendar dates. */
export const DATE_RULES: RegisterOptions<any, string> = {
  validate: (value: string) => {
    if (!value) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'validation.invalidDate';

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 'validation.invalidDate' : true;
  },
};
