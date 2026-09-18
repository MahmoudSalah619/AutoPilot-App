import { TABLES, USE_MOCK_DATA } from '@/apis/config';
import { supabase } from '@/apis/supabaseClient';
import { delay } from '@/apis/mock/store';
import { seedDiagnosticCodes } from '@/apis/mock/seed';
import type { DiagnosticCode, DiagnosticSystem } from '@/@types/models';
import { RepositoryError, unwrap } from './helpers';

export interface DiagnosticFilter {
  /** Matches the code itself, its title, or its description. */
  search?: string;
  system?: DiagnosticSystem;
}

/**
 * Case-insensitive match across code, title and description.
 *
 * A driver typing "P030" should see P0300 and P0301; one typing "misfire"
 * should see both as well.
 */
function matches(entry: DiagnosticCode, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;

  return (
    entry.code.toLowerCase().includes(needle) ||
    entry.title.toLowerCase().includes(needle) ||
    entry.description.toLowerCase().includes(needle)
  );
}

export async function searchDiagnosticCodes(filter?: DiagnosticFilter): Promise<DiagnosticCode[]> {
  if (USE_MOCK_DATA) {
    const results = seedDiagnosticCodes
      .filter((entry) => !filter?.system || entry.system === filter.system)
      .filter((entry) => matches(entry, filter?.search ?? ''));

    return delay(results, 180);
  }

  let query = supabase.from(TABLES.diagnosticCodes).select('*');

  if (filter?.system) query = query.eq('system', filter.system);
  if (filter?.search) {
    const needle = `%${filter.search.trim()}%`;
    query = query.or(`code.ilike.${needle},title.ilike.${needle}`);
  }

  return unwrap<DiagnosticCode[]>(await query.order('code', { ascending: true }));
}

export async function getDiagnosticCode(code: string): Promise<DiagnosticCode> {
  if (USE_MOCK_DATA) {
    const found = seedDiagnosticCodes.find(
      (entry) => entry.code.toLowerCase() === code.toLowerCase()
    );

    if (!found) throw new RepositoryError('Diagnostic code not found', 404);
    return delay(found, 120);
  }

  return unwrap<DiagnosticCode>(
    await supabase.from(TABLES.diagnosticCodes).select('*').eq('code', code).single()
  );
}
