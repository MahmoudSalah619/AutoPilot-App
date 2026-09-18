import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';

import { SPACING } from '@/constants/Layout';
import { useDeleteDocumentMutation, useGetDocumentsQuery } from '@/apis/autopilotApi';
import { summarizeDocuments } from '@/apis/repositories/documents';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import type { DocumentType, VehicleDocument } from '@/@types/models';
import { ConfirmDialog, Screen } from '@/shared/components/layout';
import { Chip, EmptyState, Fab, SkeletonCard, StatTile } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { DocumentCard, DocumentSheet } from '@/features/services/documents';

const TYPE_FILTERS: DocumentType[] = [
  'insurance',
  'registration',
  'driverLicense',
  'inspection',
  'warranty',
  'receipt',
  'other',
];

export default function VehicleDocuments() {
  const { t } = useTranslation();
  const { vehicle, hasVehicle } = useActiveVehicle();

  const [typeFilter, setTypeFilter] = useState<DocumentType | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<VehicleDocument | undefined>();
  const [pendingDelete, setPendingDelete] = useState<VehicleDocument | undefined>();

  const {
    data: documents = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetDocumentsQuery(vehicle ? { vehicleId: vehicle.id } : undefined, { skip: !vehicle });

  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const statistics = useMemo(() => summarizeDocuments(documents), [documents]);

  const visibleDocuments = useMemo(
    () => (typeFilter ? documents.filter((document) => document.type === typeFilter) : documents),
    [documents, typeFilter]
  );

  const openCreate = () => {
    setEditingDocument(undefined);
    setIsSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteDocument(pendingDelete.id).unwrap();
      toast.success(t('documents.deleteTitle'));
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.deleteFailed';
      toast.error(t('errors.deleteFailed'), t(message, { defaultValue: message }));
    } finally {
      setPendingDelete(undefined);
    }
  };

  const handleOpenFile = async (document: VehicleDocument) => {
    if (!document.fileUri) return;

    try {
      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        toast.info(t('errors.unexpected'));
        return;
      }

      await Sharing.shareAsync(document.fileUri, {
        mimeType: document.mimeType,
        dialogTitle: document.title,
      });
    } catch {
      toast.error(t('errors.unexpected'));
    }
  };

  const header = {
    titleTx: 'documents.title',
    subtitleTx: 'documents.subtitle',
    variant: 'large' as const,
  };

  if (!hasVehicle) {
    return (
      <Screen header={header}>
        <EmptyState icon="truck" titleTx="vehicle.emptyTitle" bodyTx="vehicle.emptyBody" />
      </Screen>
    );
  }

  return (
    <Screen
      padded={false}
      header={header}
      overlay={
        <Fab
          aboveTabBar={false}
          onPress={openCreate}
          labelTx="documents.addTitle"
          accessibilityLabel={t('documents.addTitle')}
        />
      }
    >
      <FlatList
        data={visibleDocuments}
        keyExtractor={(document) => document.id}
        renderItem={({ item }) => (
          <DocumentCard
            document={item}
            onEdit={() => {
              setEditingDocument(item);
              setIsSheetOpen(true);
            }}
            onDelete={() => setPendingDelete(item)}
            onOpenFile={() => handleOpenFile(item)}
          />
        )}
        contentContainerStyle={{
          paddingBottom: 140,
          paddingHorizontal: SPACING.screen,
          rowGap: SPACING.md,
        }}
        showsVerticalScrollIndicator={false}
        refreshing={isFetching}
        onRefresh={refetch}
        ListHeaderComponent={
          <View style={{ rowGap: SPACING.lg, paddingBottom: SPACING.md }}>
            <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
              <StatTile
                value={String(statistics.total)}
                labelTx="documents.stats.total"
                icon="folder"
              />
              <StatTile
                value={String(statistics.expiringSoon)}
                labelTx="documents.stats.expiringSoon"
                icon="clock"
                tone={statistics.expiringSoon > 0 ? 'warning' : 'text'}
              />
              <StatTile
                value={String(statistics.expired)}
                labelTx="documents.stats.expired"
                icon="alert-triangle"
                tone={statistics.expired > 0 ? 'danger' : 'success'}
              />
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={[null, ...TYPE_FILTERS]}
              keyExtractor={(type) => type ?? 'all'}
              contentContainerStyle={{ columnGap: SPACING.sm }}
              renderItem={({ item }) => (
                <Chip
                  tx={item ? `documents.types.${item}` : 'maintenance.all'}
                  selected={typeFilter === item}
                  onPress={() => setTypeFilter(item)}
                />
              )}
            />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <SkeletonCard count={3} />
          ) : (
            <EmptyState
              layout="inline"
              icon="file-text"
              titleTx="documents.emptyTitle"
              bodyTx="documents.emptyBody"
              actionTx="documents.addTitle"
              onAction={openCreate}
            />
          )
        }
      />

      {!!vehicle && (
        <DocumentSheet
          isVisible={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          vehicleId={vehicle.id}
          document={editingDocument}
        />
      )}

      <ConfirmDialog
        isVisible={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(undefined)}
        onConfirm={handleDelete}
        titleTx="documents.deleteTitle"
        bodyTx="documents.deleteBody"
        confirmTx="common.delete"
        tone="danger"
        icon="trash-2"
        loading={isDeleting}
      />
    </Screen>
  );
}
