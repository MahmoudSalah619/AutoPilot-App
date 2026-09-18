import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import dayjs from 'dayjs';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import {
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useUploadDocumentFileMutation,
} from '@/apis/autopilotApi';
import type { DocumentType, VehicleDocument } from '@/@types/models';
import { Sheet } from '@/shared/components/layout';
import {
  Button,
  DateField,
  FormInput,
  IconButton,
  OptionGroup,
  Text,
} from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { formatFileSize } from '@/utils/format';

const DOCUMENT_TYPES: DocumentType[] = [
  'insurance',
  'registration',
  'driverLicense',
  'inspection',
  'warranty',
  'receipt',
  'other',
];

const TYPE_OPTIONS = DOCUMENT_TYPES.map((value) => ({
  value,
  labelTx: `documents.types.${value}`,
}));

interface PickedFile {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

interface DocumentFormValues {
  title: string;
  type: DocumentType;
  issueDate: string;
  expiryDate: string;
  notes: string;
}

export interface DocumentSheetProps {
  isVisible: boolean;
  onClose: () => void;
  vehicleId: string;
  document?: VehicleDocument;
}

/** Create/edit sheet for a stored document, including file attachment. */
export default function DocumentSheet({
  isVisible,
  onClose,
  vehicleId,
  document,
}: DocumentSheetProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [createDocument, { isLoading: isCreating }] = useCreateDocumentMutation();
  const [updateDocument, { isLoading: isUpdating }] = useUpdateDocumentMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadDocumentFileMutation();

  const [file, setFile] = useState<PickedFile | null>(null);

  const { control, handleSubmit, reset } = useForm<DocumentFormValues>({
    defaultValues: {
      title: '',
      type: 'insurance',
      issueDate: '',
      expiryDate: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!isVisible) return;

    reset({
      title: document?.title ?? '',
      type: document?.type ?? 'insurance',
      issueDate: document?.issueDate ?? '',
      expiryDate: document?.expiryDate ?? '',
      notes: document?.notes ?? '',
    });

    setFile(
      document?.fileName
        ? {
            uri: document.fileUri ?? '',
            name: document.fileName,
            size: document.fileSize,
            mimeType: document.mimeType,
          }
        : null
    );
  }, [isVisible, document, reset]);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setFile({
        uri: asset.uri,
        name: asset.name,
        size: asset.size ?? undefined,
        mimeType: asset.mimeType ?? undefined,
      });
    } catch {
      toast.error(t('errors.unexpected'));
    }
  };

  const onSubmit = async (values: DocumentFormValues) => {
    try {
      let fileUri = document?.fileUri;

      // Only re-upload when the user picked a new local file.
      if (file && file.uri && file.uri !== document?.fileUri) {
        fileUri = await uploadFile({
          localUri: file.uri,
          fileName: file.name,
          mimeType: file.mimeType ?? 'application/octet-stream',
        }).unwrap();
      }

      const draft = {
        vehicleId,
        title: values.title.trim(),
        type: values.type,
        issueDate: values.issueDate || undefined,
        expiryDate: values.expiryDate || undefined,
        notes: values.notes.trim() || undefined,
        fileUri: file ? fileUri : undefined,
        fileName: file?.name,
        fileSize: file?.size,
        mimeType: file?.mimeType,
      };

      if (document) {
        await updateDocument({ id: document.id, patch: draft }).unwrap();
      } else {
        await createDocument(draft).unwrap();
      }

      toast.success(t(document ? 'documents.editTitle' : 'documents.addTitle'));
      onClose();
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.saveFailed';
      toast.error(t('errors.saveFailed'), t(message, { defaultValue: message }));
    }
  };

  return (
    <Sheet
      isVisible={isVisible}
      onClose={onClose}
      titleTx={document ? 'documents.editTitle' : 'documents.addTitle'}
      subtitleTx={document ? undefined : 'documents.addSubtitle'}
      footer={
        <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
          <Button variant="outline" tx="common.cancel" onPress={onClose} style={{ flex: 1 }} />
          <Button
            tx="common.save"
            loading={isCreating || isUpdating || isUploading}
            onPress={handleSubmit(onSubmit)}
            style={{ flex: 1.4 }}
          />
        </View>
      }
    >
      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, value } }) => (
          <OptionGroup
            labelTx="documents.type"
            options={TYPE_OPTIONS}
            value={value}
            onChange={onChange}
            required
          />
        )}
      />

      <FormInput
        control={control}
        name="title"
        labelTx="documents.documentTitle"
        placeholderTx="documents.documentTitlePlaceholder"
        required
      />

      <Controller
        control={control}
        name="issueDate"
        render={({ field: { onChange, value } }) => (
          <DateField
            labelTx="documents.issueDate"
            value={value}
            onChange={onChange}
            maxDate={dayjs().toISOString()}
            clearable
          />
        )}
      />

      <Controller
        control={control}
        name="expiryDate"
        render={({ field: { onChange, value } }) => (
          <DateField
            labelTx="documents.expiryDate"
            hintTx="documents.expiryHint"
            value={value}
            onChange={onChange}
            clearable
          />
        )}
      />

      <View style={{ rowGap: SPACING.sm }}>
        <Text variant="label" color="textSecondary" tx="documents.attachFile" />

        {file ? (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: colors.surfaceAlt,
              borderRadius: RADIUS.md,
              columnGap: SPACING.sm,
              flexDirection: 'row',
              padding: SPACING.md,
            }}
          >
            <Feather name="file-text" size={18} color={colors.primary} />

            <View style={{ flex: 1, rowGap: 2 }}>
              <Text variant="labelSm" numberOfLines={1}>
                {file.name}
              </Text>
              <Text variant="caption" color="textMuted">
                {formatFileSize(file.size)}
              </Text>
            </View>

            <IconButton
              icon="x"
              size="sm"
              color="textMuted"
              onPress={() => setFile(null)}
              accessibilityLabel={t('documents.removeFile')}
            />
          </View>
        ) : (
          <Button
            variant="outline"
            tx="documents.attachFile"
            fullWidth
            leftIcon={<Feather name="paperclip" size={16} color={colors.text} />}
            onPress={handlePickFile}
          />
        )}
      </View>

      <FormInput
        control={control}
        name="notes"
        labelTx="common.notes"
        placeholderTx="common.notesPlaceholder"
        multilineBox
      />
    </Sheet>
  );
}
