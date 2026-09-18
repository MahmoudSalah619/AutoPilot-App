import React from 'react';
import { Platform, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import ReactNativeModal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RADIUS, SPACING } from '@/constants/Layout';
import METRICS from '@/constants/Metrics';
import { useTheme } from '@/theme';
import IconButton from '@/shared/components/ui/IconButton';
import Text from '@/shared/components/ui/Text';

export interface SheetProps {
  isVisible: boolean;
  onClose: () => void;
  titleTx?: string;
  subtitleTx?: string;
  children: React.ReactNode;
  /** Pinned action row at the bottom, outside the scroll area. */
  footer?: React.ReactNode;
  /** Blocks backdrop and swipe dismissal. For destructive confirmations. */
  dismissible?: boolean;
  /** Fraction of screen height the body may grow to. */
  maxHeightRatio?: number;
  /** Removes the body padding, for full-bleed content such as a list. */
  flush?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Bottom sheet modal.
 *
 * The standard container for every create/edit form and filter panel. Content
 * scrolls, the footer stays pinned, and the sheet lifts above the keyboard.
 */
export default function Sheet({
  isVisible,
  onClose,
  titleTx,
  subtitleTx,
  children,
  footer,
  dismissible = true,
  maxHeightRatio = 0.88,
  flush = false,
  contentStyle,
  testID,
}: SheetProps) {
  const { colors, elevation } = useTheme();
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    if (dismissible) onClose();
  };

  return (
    <ReactNativeModal
      testID={testID}
      isVisible={isVisible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection={dismissible ? ['down'] : undefined}
      propagateSwipe
      useNativeDriver
      useNativeDriverForBackdrop
      avoidKeyboard={Platform.OS === 'ios'}
      backdropColor={colors.overlay}
      backdropOpacity={1}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ justifyContent: 'flex-end', margin: 0 }}
    >
      <View
        style={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: RADIUS.xxl,
          borderTopRightRadius: RADIUS.xxl,
          maxHeight: METRICS.screenHeight * maxHeightRatio,
          paddingTop: SPACING.md,
          ...elevation.lg(),
        }}
      >
        {/* Grab handle */}
        <View
          style={{
            alignSelf: 'center',
            backgroundColor: colors.borderStrong,
            borderRadius: RADIUS.pill,
            height: 4,
            marginBottom: SPACING.md,
            width: 40,
          }}
        />

        {(!!titleTx || dismissible) && (
          <View
            style={{
              alignItems: 'flex-start',
              columnGap: SPACING.md,
              flexDirection: 'row',
              paddingBottom: SPACING.md,
              paddingHorizontal: SPACING.xl,
            }}
          >
            <View style={{ flex: 1, rowGap: SPACING.xxs }}>
              {!!titleTx && <Text variant="h1" tx={titleTx} />}
              {!!subtitleTx && <Text variant="bodySm" color="textSecondary" tx={subtitleTx} />}
            </View>

            {dismissible && (
              <IconButton
                icon="x"
                size="sm"
                variant="soft"
                color="textSecondary"
                onPress={onClose}
                accessibilityLabel="common.close"
              />
            )}
          </View>
        )}

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            {
              paddingBottom: SPACING.lg,
              ...(!flush && { paddingHorizontal: SPACING.xl }),
              rowGap: SPACING.lg,
            },
            contentStyle,
          ]}
        >
          {children}
        </ScrollView>

        <View
          style={{
            borderTopColor: footer ? colors.border : colors.transparent,
            borderTopWidth: footer ? 1 : 0,
            paddingBottom: Math.max(insets.bottom, SPACING.lg),
            paddingHorizontal: SPACING.xl,
            paddingTop: footer ? SPACING.md : 0,
          }}
        >
          {footer}
        </View>
      </View>
    </ReactNativeModal>
  );
}
