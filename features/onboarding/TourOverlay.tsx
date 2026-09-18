import React, { useCallback, useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import { Button, Text } from '@/shared/components/ui';
import type { TargetRect, TourStep } from './types';

const TOOLTIP_GAP = SPACING.md;
const DEFAULT_PADDING = SPACING.md;

/** Roughly how tall the tooltip card is. Used only to choose a side. */
const TOOLTIP_ESTIMATE = 210;

export interface TourOverlayProps {
  isVisible: boolean;
  step?: TourStep;
  rect: TargetRect | null;
  stepIndex: number;
  stepCount: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

/**
 * The dimmed overlay with a cut-out around the current target.
 *
 * Rendered as an absolutely-positioned sibling of the app content rather than
 * inside a `Modal`. A Modal is a *separate native window*, so its coordinate
 * space does not match the one `measureInWindow` reports — which shifted every
 * cut-out by the status-bar height. Living in the same hierarchy removes that
 * mismatch by construction.
 *
 * As a second safeguard the overlay measures its own window origin and
 * subtracts it, so the highlight still lands correctly if anything above it
 * introduces padding or an inset.
 */
export default function TourOverlay({
  isVisible,
  step,
  rect,
  stepIndex,
  stepCount,
  onNext,
  onBack,
  onSkip,
}: TourOverlayProps) {
  const { t } = useTranslation();
  const { colors, elevation } = useTheme();
  const insets = useSafeAreaInsets();

  const rootRef = useRef<View>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  /**
   * Captures the overlay's size and its position in the window, so the SVG
   * canvas matches the real viewport rather than a cached `Dimensions` value
   * that goes stale on rotation or in split screen.
   */
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });

    rootRef.current?.measureInWindow((x, y) => {
      if (Number.isFinite(x) && Number.isFinite(y)) setOrigin({ x, y });
    });
  }, []);

  /** The cut-out, translated into overlay-local space and clamped on screen. */
  const hole = useMemo(() => {
    if (!rect || size.width === 0) return null;

    const padding = step?.padding ?? DEFAULT_PADDING;

    // Window coords minus the overlay's own origin gives overlay-local coords.
    const left = rect.x - origin.x - padding;
    const top = rect.y - origin.y - padding;

    const x = Math.max(0, left);
    const y = Math.max(0, top);

    // Clamping the origin to 0 would otherwise stretch the hole, so trim by
    // the same amount that was clipped and keep it hugging the element.
    const width = rect.width + padding * 2 + Math.min(0, left);
    const height = rect.height + padding * 2 + Math.min(0, top);

    return {
      x,
      y,
      width: Math.max(0, Math.min(size.width - x, width)),
      height: Math.max(0, Math.min(size.height - y, height)),
      radius: step?.radius ?? RADIUS.md,
    };
  }, [rect, step, size, origin]);

  /**
   * Places the tooltip on whichever side of the target has room, unless the
   * step asked for a side and that side can actually fit it.
   */
  const tooltipPosition = useMemo<ViewStyle>(() => {
    if (!hole || size.height === 0) {
      return {
        top: Math.max(insets.top + SPACING.xl, size.height / 2 - TOOLTIP_ESTIMATE / 2),
      };
    }

    const placement = step?.placement ?? 'auto';
    const spaceBelow = size.height - (hole.y + hole.height) - insets.bottom;
    const spaceAbove = hole.y - insets.top;

    const wantsAbove =
      placement === 'above' || (placement === 'auto' && spaceBelow < TOOLTIP_ESTIMATE);

    if (wantsAbove && spaceAbove >= TOOLTIP_ESTIMATE + TOOLTIP_GAP) {
      return { bottom: size.height - hole.y + TOOLTIP_GAP };
    }

    // Otherwise sit below the target, kept clear of the bottom inset.
    return {
      top: Math.min(
        hole.y + hole.height + TOOLTIP_GAP,
        Math.max(insets.top, size.height - insets.bottom - TOOLTIP_ESTIMATE)
      ),
    };
  }, [hole, step, size.height, insets.top, insets.bottom]);

  const isLastStep = stepIndex === stepCount - 1;

  return (
    <View
      ref={rootRef}
      collapsable={false}
      onLayout={handleLayout}
      // Stays mounted while hidden so its size and origin are already known
      // when the first step appears; `none` keeps it out of the touch path.
      pointerEvents={isVisible ? 'auto' : 'none'}
      style={[
        StyleSheet.absoluteFill,
        { elevation: isVisible ? 24 : 0, zIndex: isVisible ? 999 : -1 },
      ]}
    >
      {isVisible && (
        // Tapping the dimmed area advances, which is how people expect a
        // coach-mark tour to behave. It also blocks the UI underneath.
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('tour.next')}
          onPress={onNext}
          style={StyleSheet.absoluteFill}
        >
          {size.width > 0 && (
            <Svg width={size.width} height={size.height} style={StyleSheet.absoluteFill}>
              <Defs>
                <Mask id="tour-mask" maskUnits="userSpaceOnUse">
                  <Rect x={0} y={0} width={size.width} height={size.height} fill="#fff" />
                  {!!hole && (
                    <Rect
                      x={hole.x}
                      y={hole.y}
                      width={hole.width}
                      height={hole.height}
                      rx={hole.radius}
                      ry={hole.radius}
                      fill="#000"
                    />
                  )}
                </Mask>
              </Defs>

              <Rect
                x={0}
                y={0}
                width={size.width}
                height={size.height}
                fill="rgba(3, 7, 14, 0.82)"
                mask="url(#tour-mask)"
              />
            </Svg>
          )}

          {/* A ring tracing the cut-out, so the highlight reads as intentional. */}
          {!!hole && (
            <Animated.View
              entering={FadeIn.duration(220)}
              exiting={FadeOut.duration(140)}
              pointerEvents="none"
              style={{
                borderColor: colors.primary,
                borderRadius: hole.radius,
                borderWidth: 2,
                height: hole.height,
                left: hole.x,
                position: 'absolute',
                top: hole.y,
                width: hole.width,
              }}
            />
          )}

          <Animated.View
            layout={LinearTransition.duration(240)}
            entering={FadeIn.duration(240)}
            style={[
              {
                backgroundColor: colors.surface,
                borderRadius: RADIUS.xl,
                end: SPACING.screen,
                padding: SPACING.xl,
                position: 'absolute',
                rowGap: SPACING.md,
                start: SPACING.screen,
                ...elevation.lg(),
              },
              tooltipPosition,
            ]}
          >
            {!!step && (
              <>
                <View style={{ rowGap: SPACING.xs }}>
                  <Text variant="overline" color="primary">
                    {`${stepIndex + 1} / ${stepCount}`}
                  </Text>
                  <Text variant="h1" tx={step.titleTx} />
                  <Text variant="body" color="textSecondary" tx={step.bodyTx} />
                </View>

                <View
                  style={{
                    alignItems: 'center',
                    columnGap: SPACING.sm,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: SPACING.xs,
                  }}
                >
                  {/* Progress dots double as the step indicator. */}
                  <View
                    style={{ alignItems: 'center', columnGap: SPACING.xs, flexDirection: 'row' }}
                  >
                    {Array.from({ length: stepCount }).map((_, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor:
                            index === stepIndex ? colors.primary : colors.borderStrong,
                          borderRadius: RADIUS.pill,
                          height: 6,
                          width: index === stepIndex ? 18 : 6,
                        }}
                      />
                    ))}
                  </View>

                  <View
                    style={{ alignItems: 'center', columnGap: SPACING.xs, flexDirection: 'row' }}
                  >
                    {stepIndex > 0 && (
                      <Button variant="ghost" size="sm" tx="tour.back" onPress={onBack} />
                    )}
                    <Button
                      size="sm"
                      tx={isLastStep ? 'tour.done' : 'tour.next'}
                      onPress={onNext}
                    />
                  </View>
                </View>

                {!isLastStep && (
                  <Button
                    variant="ghost"
                    size="sm"
                    tx="tour.skip"
                    onPress={onSkip}
                    style={{ alignSelf: 'center' }}
                  />
                )}
              </>
            )}
          </Animated.View>
        </Pressable>
      )}
    </View>
  );
}
