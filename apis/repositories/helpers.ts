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
