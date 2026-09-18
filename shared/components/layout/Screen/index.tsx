import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SPACING } from '@/constants/Layout';
import { TAB_BAR_HEIGHT } from '@/constants/Metrics';
import { useTheme } from '@/theme';
import ScreenHeader, { type ScreenHeaderProps } from '@/shared/components/layout/ScreenHeader';

export interface ScreenProps {
  children: React.ReactNode;
  /** Renders a `ScreenHeader` above the content. */
  header?: ScreenHeaderProps;
  /** Wraps content in a ScrollView. Leave off for screens owning a FlatList. */
  scroll?: boolean;
  /** Applies the standard side gutter. */
  padded?: boolean;
  /** Vertical rhythm between direct children. */
  gap?: keyof typeof SPACING;
  /** Reserves space for the tab bar. Set false on pushed (non-tab) screens. */
  hasTabBar?: boolean;
  /** Pull-to-refresh. Only applies when `scroll` is set. */
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Sticky content pinned to the bottom, above the safe area. */
  footer?: React.ReactNode;
  /** Absolutely positioned overlay content such as a `Fab`. */
  overlay?: React.ReactNode;
  /** Paints the screen on the elevated surface instead of the app background. */
  surface?: 'background' | 'surface';
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * The single screen shell: safe area, background, optional header, scrolling,
 * keyboard avoidance, tab-bar clearance and a sticky footer slot.
 *
 * This replaces the three competing patterns the app had before
 * (`MainScreenWrapper`, `AuthScreenWrapper`, and raw `SafeAreaView` plus a
 * hand-rolled header), which is where most of the visual drift came from.
 */
export default function Screen({
  children,
  header,
  scroll = false,
  padded = true,
  gap = 'lg',
  hasTabBar = false,
  refreshing,
  onRefresh,
  footer,
  overlay,
  surface = 'background',
  contentStyle,
  style,
  testID,
}: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const bottomClearance =
    (hasTabBar ? TAB_BAR_HEIGHT + insets.bottom : Math.max(insets.bottom, SPACING.lg)) + SPACING.lg;

  const content = (
    <View
      style={[
        {
          rowGap: SPACING[gap],
          ...(padded && { paddingHorizontal: SPACING.screen }),
        },
        !scroll && { flex: 1 },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View
      testID={testID}
      style={[
        {
          backgroundColor: colors[surface === 'surface' ? 'surface' : 'background'],
          flex: 1,
          paddingTop: insets.top,
        },
        style,
      ]}
    >
      {!!header && <ScreenHeader {...header} />}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', default: undefined })}
      >
        {scroll ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: footer ? SPACING.lg : bottomClearance,
              paddingTop: header ? 0 : SPACING.md,
            }}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={Boolean(refreshing)}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                  progressBackgroundColor={colors.surface}
                />
              ) : undefined
            }
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}

        {!!footer && (
          <View
            style={{
              backgroundColor: colors[surface === 'surface' ? 'surface' : 'background'],
              borderTopColor: colors.border,
              borderTopWidth: 1,
              paddingBottom: Math.max(insets.bottom, SPACING.lg),
              paddingHorizontal: SPACING.screen,
              paddingTop: SPACING.md,
            }}
          >
            {footer}
          </View>
        )}
      </KeyboardAvoidingView>

      {overlay}
    </View>
  );
}
