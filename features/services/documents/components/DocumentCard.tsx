import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import type { DocumentStatus, DocumentType, VehicleDocument } from '@/@types/models';
import { Badge, Card, IconButton, Text, type BadgeTone } from '@/shared/components/ui';
import { describeDueDate, formatDate, formatFileSize } from '@/utils/format';
import type { ColorToken } from '@/constants/Colors';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  valid: 'success',
  expiringSoon: 'warning',
  expired: 'danger',
  noExpiry: 'neutral',
};

const TYPE_META: Record<DocumentType, { icon: FeatherIconName; fg: ColorToken; bg: ColorToken }> = {
  insurance: { icon: 'shield', fg: 'accentBlue', bg: 'accentBlueSoft' },
  registration: { icon: 'clipboard', fg: 'accentViolet', bg: 'accentVioletSoft' },
  driverLicense: { icon: 'credit-card', fg: 'accentTeal', bg: 'accentTealSoft' },
  inspection: { icon: 'check-square', fg: 'accentGreen', bg: 'accentGreenSoft' },
  warranty: { icon: 'award', fg: 'accentAmber', bg: 'accentAmberSoft' },
  receipt: { icon: 'file-text', fg: 'textSecondary', bg: 'surfaceAlt' },
  other: { icon: 'file', fg: 'textSecondary', bg: 'surfaceAlt' },
};

export interface DocumentCardProps {
  document: VehicleDocument;
  onEdit: () => void;
  onDelete: () => void;
  onOpenFile?: () => void;
}

/**
 * One stored document.
 *
 * The expiry countdown is the headline, because that is the only part of a
 * document that can cost the driver a fine.
 */
export default function DocumentCard({
  document,
  onEdit,
  onDelete,
  onOpenFile,
}: DocumentCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const meta = TYPE_META[document.type];
  const due = document.expiryDate ? describeDueDate(document.expiryDate) : null;

  return (
    <Card padding="lg" style={{ rowGap: SPACING.md }}>
      <View style={{ alignItems: 'flex-start', columnGap: SPACING.md, flexDirection: 'row' }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors[meta.bg],
            borderRadius: RADIUS.md,
            height: 40,
            justifyContent: 'center',
            width: 40,
          }}
        >
          <Feather name={meta.icon} size={18} color={colors[meta.fg]} />
        </View>

        <View style={{ flex: 1, rowGap: 2 }}>
          <Text variant="h3" numberOfLines={2}>
            {document.title}
          </Text>
          <Text variant="caption" color="textMuted">
            {t(`documents.types.${document.type}`)}
          </Text>
        </View>

        <Badge tone={STATUS_TONE[document.status]} tx={`status.${document.status}`} size="sm" />
      </View>

      <View
        style={{
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          flexDirection: 'row',
          paddingTop: SPACING.md,
        }}
      >
        <View style={{ flex: 1, rowGap: 2 }}>
          <Text variant="caption" color="textMuted" tx="documents.expiryDate" />
          <Text
            variant="labelSm"
            color={
              document.status === 'expired'
                ? 'danger'
                : document.status === 'expiringSoon'
                  ? 'warning'
                  : 'text'
            }
          >
            {document.expiryDate ? formatDate(document.expiryDate) : t('status.noExpiry')}
          </Text>
        </View>

        {!!due && (
          <View style={{ flex: 1, rowGap: 2 }}>
            <Text variant="caption" color="textMuted" tx="common.date" />
            <Text variant="labelSm">{t(due.key, due.values ?? {}) as string}</Text>
          </View>
        )}
      </View>

      <View
        style={{
          alignItems: 'center',
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          columnGap: SPACING.xs,
          flexDirection: 'row',
          paddingTop: SPACING.sm,
        }}
      >
        {document.fileName ? (
          <View
            style={{ alignItems: 'center', columnGap: SPACING.xs, flexDirection: 'row', flex: 1 }}
          >
            <Feather name="paperclip" size={14} color={colors.textMuted} />
            <Text variant="caption" color="textMuted" numberOfLines={1} style={{ flex: 1 }}>
              {`${document.fileName} · ${formatFileSize(document.fileSize)}`}
            </Text>
          </View>
        ) : (
          <Text variant="caption" color="textDisabled" tx="documents.noFile" style={{ flex: 1 }} />
        )}

        {!!document.fileUri && !!onOpenFile && (
          <IconButton
            icon="external-link"
            size="sm"
            color="primary"
            onPress={onOpenFile}
            accessibilityLabel={t('documents.openFile')}
          />
        )}
        <IconButton
          icon="edit-2"
          size="sm"
          color="textSecondary"
          onPress={onEdit}
          accessibilityLabel={t('common.edit')}
        />
        <IconButton
          icon="trash-2"
          size="sm"
          color="danger"
          onPress={onDelete}
          accessibilityLabel={t('common.delete')}
        />
      </View>
    </Card>
  );
}
