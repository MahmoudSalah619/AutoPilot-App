/**
 * Shared plumbing for the repository layer.
 *
 * The app's domain models are camelCase; Supabase columns are snake_case.
 * Rather than hand-writing two mappers per entity, these helpers convert key
 * casing generically — safe here because every model is a flat record of
 * primitives, arrays and plain objects.
 */

import type { PostgrestError } from '@supabase/supabase-js';

export class RepositoryError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'RepositoryError';
    this.status = status;
  }
}

function toSnake(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function toCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
}

function convertKeys<T>(value: unknown, transform: (key: string) => string): T {
  if (Array.isArray(value)) {
    return value.map((item) => convertKeys(item, transform)) as T;
  }

  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        transform(key),
        convertKeys(entry, transform),
      ])
    ) as T;
  }

  return value as T;
}

/** Domain object to Supabase row. */
export function toRow<T extends object>(value: Partial<T>): Record<string, unknown> {
  return convertKeys<Record<string, unknown>>(value, toSnake);
}

/** Supabase row to domain object. */
export function fromRow<T>(value: unknown): T {
  return convertKeys<T>(value, toCamel);
}

/**
 * Throws on a Postgrest error, otherwise returns the mapped payload.
 * Keeps every repository free of repeated `if (error) …` blocks.
 */
export function unwrap<T>(result: { data: unknown; error: PostgrestError | null }): T {
  if (result.error) {
    throw new RepositoryError(result.error.message, Number(result.error.code) || 500);
  }

  return fromRow<T>(result.data);
}

/* ── Live-schema coercions ────────────────────────────────────────────────── */

/**
 * The live tables key off `bigint` identities while every domain model uses
 * `string` ids. These two functions are the only place that seam is crossed.
 */
export function toDomainId(value: number | string | null | undefined): string {
  return value == null ? '' : String(value);
}

/** Throws rather than sending `NaN` to Postgres, which fails opaquely. */
export function toRowId(value: string | number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new RepositoryError('errors.invalidId', 400);
  }

  return parsed;
}

/** `vehicles.year` and `car_models.year` are `date` columns, not integers. */
export function yearToDate(year?: number | null): string | null {
  if (year == null || !Number.isFinite(year)) return null;
  return `${String(year).padStart(4, '0')}-01-01`;
}

export function dateToYear(value?: string | null): number | undefined {
  if (!value) return undefined;
  const year = Number(value.slice(0, 4));
  return Number.isFinite(year) ? year : undefined;
}

/** Date-only column value from an ISO date or timestamp. */
export function toDateOnly(value?: string | null): string | null {
  return value ? value.slice(0, 10) : null;
}

/**
 * Drops keys whose value is `undefined`.
 *
 * Patches are built by spreading optional model fields, and sending an
 * explicit `undefined` to PostgREST nulls the column instead of leaving it
 * alone — which is how a partial edit quietly erases data.
 */
export function compact<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined));
}

/** Throws on a Postgrest error without mapping the payload. */
export function assertOk(result: { error: PostgrestError | null }): void {
  if (result.error) {
    throw new RepositoryError(result.error.message, Number(result.error.code) || 500);
  }
}

/**
 * Like `unwrap`, but hands back the row exactly as Postgres sent it.
 *
 * `unwrap` camelCases every key, which is right for tables whose columns
 * line up with the domain model one-for-one. The live tables do not line up,
 * so their repositories write explicit mappers and need the raw snake_case
 * row to map *from* — a silent rename in between is how a mapper ends up
 * reading `undefined` off every field.
 */
export function unwrapRaw<T>(result: { data: unknown; error: PostgrestError | null }): T {
  if (result.error) {
    throw new RepositoryError(result.error.message, Number(result.error.code) || 500);
  }

  return result.data as T;
}

/** Sorts a list by an ISO date field, newest first. */
export function byDateDesc<T>(items: T[], field: keyof T): T[] {
  return [...items].sort(
    (a, b) => new Date(String(b[field])).getTime() - new Date(String(a[field])).getTime()
  );
}

/** Sorts a list by an ISO date field, soonest first. */
export function byDateAsc<T>(items: T[], field: keyof T): T[] {
  return [...items].sort(
    (a, b) => new Date(String(a[field])).getTime() - new Date(String(b[field])).getTime()
  );
}
