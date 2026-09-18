import React from 'react';
import { View } from 'react-native';
import ReactNativeModal from 'react-native-modal';
import { Feather } from '@expo/vector-icons';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Button from '@/shared/components/ui/Button';
import Text from '@/shared/components/ui/Text';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

export interface ConfirmDialogProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titleTx: string;
  bodyTx?: string;
  confirmTx?: string;
  cancelTx?: string;
  /** `danger` styles the confirm button destructively. */
  tone?: 'default' | 'danger';
  icon?: FeatherIconName;
  loading?: boolean;
  testID?: string;
}

/**
 * Themed confirmation dialog.
 *
 * Replaces `Alert.alert`, which ignores the app's theme and typography and
 * renders differently on each platform.
 */
export default function ConfirmDialog({
  isVisible,
  onClose,
  onConfirm,
  titleTx,
  bodyTx,
  confirmTx = 'common.confirm',
  cancelTx = 'common.cancel',
  tone = 'default',
  icon,
  loading = false,
  testID,
}: ConfirmDialogProps) {
  const { colors, elevation } = useTheme();
  const isDanger = tone === 'danger';
  const resolvedIcon = icon ?? (isDanger ? 'alert-triangle' : 'help-circle');

  return (
    <ReactNativeModal
      testID={testID}
      isVisible={isVisible}
      onBackdropPress={loading ? undefined : onClose}
      onBackButtonPress={loading ? undefined : onClose}
      useNativeDriver
      useNativeDriverForBackdrop
      backdropColor={colors.overlay}
      backdropOpacity={1}
      animationIn="zoomIn"
      animationOut="zoomOut"
      style={{ alignItems: 'center', justifyContent: 'center', margin: SPACING.xxl }}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: RADIUS.xl,
          padding: SPACING.xxl,
          rowGap: SPACING.md,
          width: '100%',
          ...elevation.lg(),
        }}
      >
        <View
          style={{
            alignItems: 'center',
            backgroundColor: isDanger ? colors.dangerSoft : colors.primarySoft,
            borderRadius: RADIUS.pill,
            height: 56,
            justifyContent: 'center',
            width: 56,
          }}
        >
          <Feather
            name={resolvedIcon}
            size={24}
            color={isDanger ? colors.danger : colors.primary}
          />
        </View>

        <Text variant="h1" align="center" tx={titleTx} />

        {!!bodyTx && <Text variant="body" color="textSecondary" align="center" tx={bodyTx} />}

        <View
          style={{
            columnGap: SPACING.md,
            flexDirection: 'row',
            marginTop: SPACING.sm,
            width: '100%',
          }}
        >
          <Button
            variant="outline"
            tx={cancelTx}
            onPress={onClose}
            disabled={loading}
            style={{ flex: 1 }}
          />
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            tx={confirmTx}
            onPress={onConfirm}
            loading={loading}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </ReactNativeModal>
  );
}
