import dayjs from 'dayjs';

import { BUCKETS, isLive, TABLES } from '@/apis/config';
import { supabase } from '@/apis/supabaseClient';
import { db, delay, mockId } from '@/apis/mock/store';
import type { DocumentStatus, VehicleDocument } from '@/@types/models';
import { resolveDocumentStatus } from '@/utils/domain';
import {
  assertOk,
  byDateAsc,
  compact,
  RepositoryError,
  toDomainId,
  toRowId,
  unwrapRaw,
} from './helpers';
import { requireUserId } from './account';

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

/* ── Live-schema mapping ──────────────────────────────────────────────────── */

/**
 * A row of `public.vehicle_documents`.
 *
 * The table holds a name, a file path and nothing else — no document type,
 * no issue or expiry date, no file metadata. Expiry tracking is the point of
 * the documents screen, so it stays inert against the live schema: every
 * document reads back as `noExpiry`, and the expiring/expired tiles show
 * zero until the migration adds the dates.
 */
interface DocumentRow {
  id: number;
  vehicle_id: number;
  name: string | null;
  image: string;
  created_at: string;
}

const DOCUMENT_COLUMNS = 'id, vehicle_id, name, image, created_at';

function fromDocumentRow(row: DocumentRow): VehicleDocument {
  return {
    id: toDomainId(row.id),
    vehicleId: toDomainId(row.vehicle_id),
    title: row.name ?? '',
    fileUri: row.image || undefined,
    createdAt: row.created_at,
    // Unbacked by the current schema.
    type: 'other',
    status: 'noExpiry',
  };
}

function toDocumentRow(draft: Partial<DocumentDraft>): Record<string, unknown> {
  return compact({
    vehicle_id: draft.vehicleId !== undefined ? toRowId(draft.vehicleId) : undefined,
    name: draft.title,
    image: draft.fileUri,
  });
}

/* ── Mock helpers ─────────────────────────────────────────────────────────── */

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

/* ── Queries ──────────────────────────────────────────────────────────────── */

export async function listDocuments(filter?: DocumentFilter): Promise<VehicleDocument[]> {
  if (!isLive('documents')) {
    const documents = applyFilter(db.documents.map(withStatus), filter);

    // Soonest expiry first; documents without one sink to the bottom.
    const dated = byDateAsc(
      documents.filter((document) => document.expiryDate),
      'expiryDate'
    );
    const undated = documents.filter((document) => !document.expiryDate);

    return delay([...dated, ...undated]);
  }

  let query = supabase.from(TABLES.vehicleDocuments).select(DOCUMENT_COLUMNS);

  if (filter?.vehicleId) query = query.eq('vehicle_id', toRowId(filter.vehicleId));

  const documents = unwrapRaw<DocumentRow[]>(
    await query.order('created_at', { ascending: false })
  ).map(fromDocumentRow);

  // `type` and `status` are fixed for live rows, so a filter on either can
  // only ever match or exclude the whole set. Applied anyway, so the two
  // branches answer the same question.
  return applyFilter(documents, filter);
}

export async function createDocument(draft: DocumentDraft): Promise<VehicleDocument> {
  if (!isLive('documents')) {
    const document: VehicleDocument = {
      ...draft,
      id: mockId('doc'),
      status: resolveDocumentStatus(draft.expiryDate),
      createdAt: dayjs().toISOString(),
    };

    db.documents.unshift(document);
    return delay(document);
  }

  const row = unwrapRaw<DocumentRow>(
    await supabase
      .from(TABLES.vehicleDocuments)
      // `image` is `not null`; a document recorded without a scan still has
      // to land somewhere, so it stores an empty path.
      .insert({ ...toDocumentRow(draft), image: draft.fileUri ?? '' })
      .select(DOCUMENT_COLUMNS)
      .single()
  );

  return fromDocumentRow(row);
}

export async function updateDocument(
  id: string,
  patch: Partial<DocumentDraft>
): Promise<VehicleDocument> {
  if (!isLive('documents')) {
    const index = db.documents.findIndex((document) => document.id === id);
    if (index === -1) throw new RepositoryError('Document not found', 404);

    db.documents[index] = withStatus({ ...db.documents[index], ...patch });
    return delay(db.documents[index]);
  }

  const row = unwrapRaw<DocumentRow>(
    await supabase
      .from(TABLES.vehicleDocuments)
      .update(toDocumentRow(patch))
      .eq('id', toRowId(id))
      .select(DOCUMENT_COLUMNS)
      .single()
  );

  return fromDocumentRow(row);
}

export async function deleteDocument(id: string): Promise<string> {
  if (!isLive('documents')) {
    db.documents = db.documents.filter((document) => document.id !== id);
    return delay(id);
  }

  assertOk(await supabase.from(TABLES.vehicleDocuments).delete().eq('id', toRowId(id)));

  return id;
}

/**
 * Uploads a picked file to storage and returns its path.
 *
 * Files are namespaced under the owner's user id so the usual
 * `(storage.foldername(name))[1] = auth.uid()` policy shape applies. The
 * bucket has no policies on it yet, so uploads are refused until they are
 * added — see `apis/migrations/001_app_gap.sql`.
 *
 * In mock mode the local URI is returned unchanged, so the picker flow is
 * fully testable without a backend.
 */
export async function uploadDocumentFile(
  localUri: string,
  fileName: string,
  mimeType: string
): Promise<string> {
  if (!isLive('documents')) {
    return delay(localUri, 600);
  }

  const userId = await requireUserId();

  const response = await fetch(localUri);
  const blob = await response.blob();
  const path = `${userId}/${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKETS.documents)
    .upload(path, blob, { contentType: mimeType, upsert: false });

  if (error) throw new RepositoryError(error.message);

  return path;
}
