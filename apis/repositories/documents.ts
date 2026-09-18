import dayjs from 'dayjs';

import { BUCKETS, TABLES, USE_MOCK_DATA } from '@/apis/config';
import { supabase } from '@/apis/supabaseClient';
import { db, delay, mockId } from '@/apis/mock/store';
import type { DocumentStatus, VehicleDocument } from '@/@types/models';
import { resolveDocumentStatus } from '@/utils/domain';
import { byDateAsc, RepositoryError, toRow, unwrap } from './helpers';

export type DocumentDraft = Omit<VehicleDocument, 'id' | 'createdAt' | 'status'>;

export interface DocumentFilter {
  vehicleId?: string;
  type?: VehicleDocument['type'];
  status?: DocumentStatus;
}

export interface DocumentStatistics {
  total: number;
  valid: number;
  expiringSoon: number;
  expired: number;
}

/** Status is derived from today's date, never from a stored column. */
function withStatus(document: VehicleDocument): VehicleDocument {
  return { ...document, status: resolveDocumentStatus(document.expiryDate) };
}

function applyFilter(documents: VehicleDocument[], filter?: DocumentFilter) {
  if (!filter) return documents;

  return documents.filter((document) => {
    if (filter.vehicleId && document.vehicleId !== filter.vehicleId) return false;
    if (filter.type && document.type !== filter.type) return false;
    if (filter.status && document.status !== filter.status) return false;

    return true;
  });
}

export function summarizeDocuments(documents: VehicleDocument[]): DocumentStatistics {
  return {
    total: documents.length,
    valid: documents.filter((document) => document.status === 'valid').length,
    expiringSoon: documents.filter((document) => document.status === 'expiringSoon').length,
    expired: documents.filter((document) => document.status === 'expired').length,
  };
}

export async function listDocuments(filter?: DocumentFilter): Promise<VehicleDocument[]> {
  if (USE_MOCK_DATA) {
    const documents = applyFilter(db.documents.map(withStatus), filter);

    // Soonest expiry first; documents without one sink to the bottom.
    const dated = byDateAsc(
      documents.filter((document) => document.expiryDate),
      'expiryDate'
    );
    const undated = documents.filter((document) => !document.expiryDate);

    return delay([...dated, ...undated]);
  }

  let query = supabase.from(TABLES.vehicleDocuments).select('*');

  if (filter?.vehicleId) query = query.eq('vehicle_id', filter.vehicleId);
  if (filter?.type) query = query.eq('type', filter.type);

  const documents = unwrap<VehicleDocument[]>(
    await query.order('expiry_date', { ascending: true, nullsFirst: false })
  ).map(withStatus);

  return filter?.status
    ? documents.filter((document) => document.status === filter.status)
    : documents;
}

export async function createDocument(draft: DocumentDraft): Promise<VehicleDocument> {
  if (USE_MOCK_DATA) {
    const document: VehicleDocument = {
      ...draft,
      id: mockId('doc'),
      status: resolveDocumentStatus(draft.expiryDate),
      createdAt: dayjs().toISOString(),
    };

    db.documents.unshift(document);
    return delay(document);
  }

  return unwrap<VehicleDocument>(
    await supabase
      .from(TABLES.vehicleDocuments)
      .insert(toRow({ ...draft, status: resolveDocumentStatus(draft.expiryDate) }))
      .select()
      .single()
  );
}

export async function updateDocument(
  id: string,
  patch: Partial<DocumentDraft>
): Promise<VehicleDocument> {
  if (USE_MOCK_DATA) {
    const index = db.documents.findIndex((document) => document.id === id);
    if (index === -1) throw new RepositoryError('Document not found', 404);

    db.documents[index] = withStatus({ ...db.documents[index], ...patch });
    return delay(db.documents[index]);
  }

  return unwrap<VehicleDocument>(
    await supabase.from(TABLES.vehicleDocuments).update(toRow(patch)).eq('id', id).select().single()
  );
}

export async function deleteDocument(id: string): Promise<string> {
  if (USE_MOCK_DATA) {
    db.documents = db.documents.filter((document) => document.id !== id);
    return delay(id);
  }

  const { error } = await supabase.from(TABLES.vehicleDocuments).delete().eq('id', id);
  if (error) throw new RepositoryError(error.message);

  return id;
}

/**
 * Uploads a picked file to storage and returns its path.
 *
 * In mock mode the local URI is returned unchanged, so the picker flow is
 * fully testable without a backend.
 */
export async function uploadDocumentFile(
  localUri: string,
  fileName: string,
  mimeType: string
): Promise<string> {
  if (USE_MOCK_DATA) {
    return delay(localUri, 600);
  }

  const response = await fetch(localUri);
  const blob = await response.blob();
  const path = `${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKETS.documents)
    .upload(path, blob, { contentType: mimeType, upsert: false });

  if (error) throw new RepositoryError(error.message);

  return path;
}
