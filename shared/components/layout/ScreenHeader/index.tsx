import React, { createContext, useContext } from 'react';
import { I18nManager, View, type StyleProp, type ViewStyle } from 'react-native';
import { useNavigation } from 'expo-router';

import { HEADER_HEIGHT } from '@/constants/Metrics';
import { SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import IconButton from '@/shared/components/ui/IconButton';
import Text from '@/shared/components/ui/Text';

/**
 * App-level content for the header bar, supplied by whichever navigator owns
 * the screens beneath it. With a brand present the bar belongs to the app —
 * back, brand, global actions — and each screen's own title and controls move
 * to a row underneath.
 */
export interface HeaderBrand {
  /** Centred in the bar regardless of what sits either side. */
  center: React.ReactNode;
  /** Trailing controls shown on every screen, e.g. notifications. */
  actions?: React.ReactNode;
  barHeight?: number;
}

const HeaderBrandContext = createContext<HeaderBrand | null>(null);

export const HeaderBrandProvider = HeaderBrandContext.Provider;

export interface ScreenHeaderProps {
  titleTx?: string;
  title?: string;
  subtitleTx?: string;
  /** Shows the back affordance when the navigator can actually go back. */
  showBack?: boolean;
  onBack?: () => void;
  /** Trailing controls, usually one or two `IconButton`s. */
  right?: React.ReactNode;
  /** `large` renders the title below the bar, iOS-style, for top-level screens. */
  variant?: 'compact' | 'large';
  /** Draws a hairline under the bar. Useful when content scrolls beneath it. */
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * The app's only screen header.
 *
 * Every pushed screen renders one of these, which is what guarantees a back
 * button exists — several sub-screens previously set `headerShown: false`
 * without providing any replacement, stranding the user.
 */
export default function ScreenHeader({
  titleTx,
  title,
  subtitleTx,
  showBack = true,
  onBack,
  right,
  variant = 'compact',
  bordered = false,
  style,
}: ScreenHeaderProps) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const brand = useContext(HeaderBrandContext);

  const canGoBack = typeof navigation.canGoBack === 'function' ? navigation.canGoBack() : false;
  const isBackVisible = showBack && (canGoBack || Boolean(onBack));

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (canGoBack) navigation.goBack();
  };

  const isLarge = variant === 'large';
  const hasTitle = Boolean(titleTx || title);

  const backButton = isBackVisible ? (
    <IconButton
      icon={I18nManager.isRTL ? 'chevron-right' : 'chevron-left'}
      size="md"
      onPress={handleBack}
      accessibilityLabelTx="common.back"
      style={{ marginStart: -SPACING.sm }}
    />
  ) : null;

  const containerStyle = [
    {
      backgroundColor: colors.background,
      paddingHorizontal: SPACING.screen,
      ...(bordered && { borderBottomColor: colors.border, borderBottomWidth: 1 }),
    },
    style,
  ];

  if (brand) {
    return (
      <View style={containerStyle}>
        <View
          style={{
            alignItems: 'center',
            columnGap: SPACING.sm,
            flexDirection: 'row',
            minHeight: brand.barHeight ?? HEADER_HEIGHT,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              alignItems: 'center',
              bottom: 0,
              justifyContent: 'center',
              left: 0,
              position: 'absolute',
              right: 0,
              top: 0,
            }}
          >
            {brand.center}
          </View>

          {backButton}
          <View style={{ flex: 1 }} />
          {brand.actions}
        </View>

        {(hasTitle || !!right) && (
          <View
            style={{
              alignItems: isLarge ? 'flex-start' : 'center',
              columnGap: SPACING.md,
              flexDirection: 'row',
              paddingBottom: SPACING.md,
            }}
          >
            <View style={{ flex: 1, rowGap: isLarge ? SPACING.xs : 2 }}>
              <Text
                variant={isLarge ? 'display' : 'h1'}
                tx={titleTx}
                numberOfLines={isLarge ? undefined : 1}
              >
                {title}
              </Text>
              {!!subtitleTx && (
                <Text
                  variant={isLarge ? 'body' : 'caption'}
                  color="textSecondary"
                  tx={subtitleTx}
                />
              )}
            </View>

            {right}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <View
        style={{
          alignItems: 'center',
          columnGap: SPACING.sm,
          flexDirection: 'row',
          minHeight: HEADER_HEIGHT,
        }}
      >
        {backButton}

        {!isLarge && (
          <View style={{ flex: 1, rowGap: 2 }}>
            <Text variant="h2" tx={titleTx} numberOfLines={1}>
              {title}
            </Text>
            {!!subtitleTx && <Text variant="caption" color="textSecondary" tx={subtitleTx} />}
          </View>
        )}

        {isLarge && <View style={{ flex: 1 }} />}

        {right}
      </View>

      {isLarge && (
        <View style={{ paddingBottom: SPACING.md, rowGap: SPACING.xs }}>
          <Text variant="display" tx={titleTx}>
            {title}
          </Text>
          {!!subtitleTx && <Text variant="body" color="textSecondary" tx={subtitleTx} />}
        </View>
      )}
    </View>
  );
}
