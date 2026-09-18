import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  useWindowDimensions,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import { Button, Text } from '@/shared/components/ui';
import type { ColorToken } from '@/constants/Colors';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

export interface HowItWorksSlide {
  key: string;
  icon: FeatherIconName;
  titleTx: string;
  bodyTx: string;
  /** Small supporting facts shown as a list under the body. */
  pointsTx?: string[];
  fg: ColorToken;
  bg: ColorToken;
}

/**
 * The walkthrough, ordered so mileage comes first — it is the input every
 * other feature derives from, so it is what a reader needs to grasp.
 */
export const HOW_IT_WORKS_SLIDES: HowItWorksSlide[] = [
  {
    key: 'mileage',
    icon: 'activity',
    titleTx: 'howItWorks.mileageTitle',
    bodyTx: 'howItWorks.mileageBody',
    pointsTx: ['howItWorks.mileagePoint1', 'howItWorks.mileagePoint2'],
    fg: 'primary',
    bg: 'primarySoft',
  },
  {
    key: 'reminders',
    icon: 'bell',
    titleTx: 'howItWorks.remindersTitle',
    bodyTx: 'howItWorks.remindersBody',
    pointsTx: ['howItWorks.remindersPoint1', 'howItWorks.remindersPoint2'],
    fg: 'accentViolet',
    bg: 'accentVioletSoft',
  },
  {
    key: 'fuel',
    icon: 'droplet',
    titleTx: 'howItWorks.fuelTitle',
    bodyTx: 'howItWorks.fuelBody',
    pointsTx: ['howItWorks.fuelPoint1', 'howItWorks.fuelPoint2'],
    fg: 'accentTeal',
    bg: 'accentTealSoft',
  },
  {
    key: 'documents',
    icon: 'file-text',
    titleTx: 'howItWorks.documentsTitle',
    bodyTx: 'howItWorks.documentsBody',
    pointsTx: ['howItWorks.documentsPoint1', 'howItWorks.documentsPoint2'],
    fg: 'accentBlue',
    bg: 'accentBlueSoft',
  },
  {
    key: 'tools',
    icon: 'grid',
    titleTx: 'howItWorks.toolsTitle',
    bodyTx: 'howItWorks.toolsBody',
    pointsTx: ['howItWorks.toolsPoint1', 'howItWorks.toolsPoint2'],
    fg: 'accentGreen',
    bg: 'accentGreenSoft',
  },
];

export interface HowItWorksCarouselProps {
  /** Shown on the final slide. Use it to replay the in-app tour. */
  onFinish: () => void;
  finishTx?: string;
  /** Secondary action on the final slide. */
  onSecondaryAction?: () => void;
  secondaryActionTx?: string;
}

/**
 * Swipeable walkthrough.
 *
 * Used from Settings, where a spotlight tour has nothing to point at — there is
 * no live screen underneath, so this explains the model in prose instead.
 */
export default function HowItWorksCarousel({
  onFinish,
  finishTx = 'howItWorks.finish',
  onSecondaryAction,
  secondaryActionTx,
}: HowItWorksCarouselProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const listRef = useRef<FlatList<HowItWorksSlide>>(null);
  const [index, setIndex] = useState(0);

  const slideWidth = width - SPACING.screen * 2;
  const isLastSlide = index === HOW_IT_WORKS_SLIDES.length - 1;

  /** Derives the page from the scroll offset, so swipes and taps agree. */
  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const page = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
      setIndex(Math.max(0, Math.min(HOW_IT_WORKS_SLIDES.length - 1, page)));
    },
    [slideWidth]
  );

  const goTo = useCallback(
    (page: number) => {
      const clamped = Math.max(0, Math.min(HOW_IT_WORKS_SLIDES.length - 1, page));
      listRef.current?.scrollToOffset({ offset: clamped * slideWidth, animated: true });
      setIndex(clamped);
    },
    [slideWidth]
  );

  return (
    <View style={{ flex: 1, rowGap: SPACING.lg }}>
      <FlatList
        ref={listRef}
        data={HOW_IT_WORKS_SLIDES}
        keyExtractor={(slide) => slide.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={slideWidth}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        // Keeps every slide the exact page width, so paging never drifts.
        getItemLayout={(_, item) => ({
          length: slideWidth,
          offset: slideWidth * item,
          index: item,
        })}
        renderItem={({ item }) => (
          <View style={{ rowGap: SPACING.xl, width: slideWidth }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: colors[item.bg],
                borderRadius: RADIUS.xl,
                height: 160,
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                  borderRadius: RADIUS.pill,
                  height: 76,
                  justifyContent: 'center',
                  width: 76,
                }}
              >
                <Feather name={item.icon} size={32} color={colors[item.fg]} />
              </View>
            </View>

            <View style={{ rowGap: SPACING.sm }}>
              <Text variant="display" tx={item.titleTx} />
              <Text variant="bodyLg" color="textSecondary" tx={item.bodyTx} />
            </View>

            {!!item.pointsTx?.length && (
              <View style={{ rowGap: SPACING.md }}>
                {item.pointsTx.map((pointTx) => (
                  <View key={pointTx} style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
                    <Feather
                      name="check"
                      size={16}
                      color={colors[item.fg]}
                      style={{ marginTop: 3 }}
                    />
                    <Text variant="bodySm" color="textSecondary" tx={pointTx} style={{ flex: 1 }} />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />

      {/* Dots are tappable, so the walkthrough can be skimmed out of order. */}
      <View
        style={{
          alignItems: 'center',
          columnGap: SPACING.sm,
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        {HOW_IT_WORKS_SLIDES.map((slide, slideIndex) => (
          <Pressable
            key={slide.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: slideIndex === index }}
            accessibilityLabel={t(slide.titleTx)}
            onPress={() => goTo(slideIndex)}
            hitSlop={10}
            style={{
              backgroundColor: slideIndex === index ? colors.primary : colors.borderStrong,
              borderRadius: RADIUS.pill,
              height: 8,
              width: slideIndex === index ? 24 : 8,
            }}
          />
        ))}
      </View>

      <View style={{ rowGap: SPACING.sm }}>
        {isLastSlide ? (
          <>
            <Button tx={finishTx} size="lg" fullWidth onPress={onFinish} />
            {!!onSecondaryAction && !!secondaryActionTx && (
              <Button
                variant="ghost"
                tx={secondaryActionTx}
                fullWidth
                onPress={onSecondaryAction}
              />
            )}
          </>
        ) : (
          <Button
            tx="tour.next"
            size="lg"
            fullWidth
            onPress={() => goTo(index + 1)}
            rightIcon={<Feather name="arrow-right" size={18} color={colors.onPrimary} />}
          />
        )}
      </View>
    </View>
  );
}
