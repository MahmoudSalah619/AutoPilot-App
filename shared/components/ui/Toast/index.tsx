import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import RNToast, { type ToastConfig, type ToastConfigParams } from 'react-native-toast-message';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';
import type { ColorToken } from '@/constants/Colors';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

type ToastTone = 'success' | 'error' | 'info';

const TONE_META: Record<
  ToastTone,
  { icon: FeatherIconName; fg: ColorToken; bg: ColorToken; border: ColorToken }
> = {
  success: { icon: 'check-circle', fg: 'success', bg: 'successSoft', border: 'successBorder' },
  error: { icon: 'alert-circle', fg: 'danger', bg: 'dangerSoft', border: 'dangerBorder' },
  info: { icon: 'info', fg: 'info', bg: 'infoSoft', border: 'infoBorder' },
};

function ToastBody({ tone, text1, text2 }: ToastConfigParams<unknown> & { tone: ToastTone }) {
  const { colors, elevation } = useTheme();
  const meta = TONE_META[tone];

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: colors[meta.bg],
        borderColor: colors[meta.border],
        borderRadius: RADIUS.md,
        borderWidth: 1,
        columnGap: SPACING.md,
        flexDirection: 'row',
        marginHorizontal: SPACING.screen,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        width: '92%',
        ...elevation.md(),
      }}
    >
      <Feather name={meta.icon} size={20} color={colors[meta.fg]} />

      <View style={{ flex: 1, rowGap: 2 }}>
        {!!text1 && (
          <Text variant="label" color={meta.fg}>
            {text1}
          </Text>
        )}
        {!!text2 && (
          <Text variant="caption" color="textSecondary">
            {text2}
          </Text>
        )}
      </View>
    </View>
  );
}

/** Themed renderers for `react-native-toast-message`. */
export const toastConfig: ToastConfig = {
  success: (props) => <ToastBody {...props} tone="success" />,
  error: (props) => <ToastBody {...props} tone="error" />,
  info: (props) => <ToastBody {...props} tone="info" />,
};

/**
 * Convenience wrappers so screens do not repeat the `type`/`text1` shape.
 * Messages are already-resolved strings; call `t()` at the call site.
 */
export const toast = {
  success: (title: string, message?: string) =>
    RNToast.show({ type: 'success', text1: title, text2: message }),
  error: (title: string, message?: string) =>
    RNToast.show({ type: 'error', text1: title, text2: message }),
  info: (title: string, message?: string) =>
    RNToast.show({ type: 'info', text1: title, text2: message }),
};

export default toast;
