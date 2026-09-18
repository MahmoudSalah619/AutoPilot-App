import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  ScrollView,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import IconButton from '@/shared/components/ui/IconButton';
import Text from '@/shared/components/ui/Text';

/** Drag distance past which releasing dismisses the sheet. */
const DISMISS_DISTANCE = 110;
/** Fling velocity that dismisses regardless of distance. */
const DISMISS_VELOCITY = 0.8;

export interface SheetProps {
  isVisible: boolean;
  onClose: () => void;
  titleTx?: string;
  subtitleTx?: string;
  children: React.ReactNode;
  /** Pinned action row at the bottom, outside the scroll area. */
  footer?: React.ReactNode;
  /** Blocks backdrop and drag dismissal. For destructive confirmations. */
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
 *
 * Drag-to-dismiss is handled here rather than by `react-native-modal`'s
 * `swipeDirection`. That prop installs a PanResponder on the whole sheet whose
 * `onStartShouldSetPanResponder` returns true for every touch, so it swallows
 * the gesture before the body `ScrollView` ever sees it and taller forms become
 * unscrollable. Owning the gesture lets us scope it to the grab handle and
 * header, which is also what the handle visually promises.
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
  const { height: windowHeight } = useWindowDimensions();

  const dragY = useRef(new Animated.Value(0)).current;

  /** Drives the scroll indicator, so a clipped form looks clipped. */
  const [isOverflowing, setIsOverflowing] = useState(false);
  const viewportHeight = useRef(0);
  const contentHeight = useRef(0);

  const handleClose = useCallback(() => {
    if (dismissible) onClose();
  }, [dismissible, onClose]);

  /** Drag handler for the header strip only; the body keeps its own scrolling. */
  const dragResponder = useMemo(
    () =>
      PanResponder.create({
        // Claimed on move, never on touch start, so the close button and any
        // other control in the header still receive their taps.
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_event, gesture) => dismissible && gesture.dy > 4,
        onPanResponderMove: (_event, gesture) => {
          // Downward only — dragging up must not detach the sheet from the edge.
          dragY.setValue(Math.max(0, gesture.dy));
        },
        onPanResponderRelease: (_event, gesture) => {
          const shouldDismiss = gesture.dy > DISMISS_DISTANCE || gesture.vy > DISMISS_VELOCITY;

          if (shouldDismiss) {
            onClose();
          }

          // Reset either way: the modal plays its own exit animation, and a
          // stale offset would otherwise persist into the next open.
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
            speed: 18,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(dragY, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
        },
      }),
    [dismissible, dragY, onClose]
  );

  const measureOverflow = useCallback(() => {
    setIsOverflowing(contentHeight.current > viewportHeight.current + 1);
  }, []);

  const handleViewportLayout = useCallback(
    (event: LayoutChangeEvent) => {
      viewportHeight.current = event.nativeEvent.layout.height;
      measureOverflow();
    },
    [measureOverflow]
  );

  const handleContentSizeChange = useCallback(
    (_width: number, height: number) => {
      contentHeight.current = height;
      measureOverflow();
    },
    [measureOverflow]
  );

  const hasHeader = !!titleTx || dismissible;

  return (
    <ReactNativeModal
      testID={testID}
      isVisible={isVisible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      onModalWillShow={() => dragY.setValue(0)}
      useNativeDriver
      useNativeDriverForBackdrop
      avoidKeyboard={Platform.OS === 'ios'}
      backdropColor={colors.overlay}
      backdropOpacity={1}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ justifyContent: 'flex-end', margin: 0 }}
    >
      <Animated.View
        style={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: RADIUS.xxl,
          borderTopRightRadius: RADIUS.xxl,
          maxHeight: windowHeight * maxHeightRatio,
          paddingTop: SPACING.md,
          transform: [{ translateY: dragY }],
          ...elevation.lg(),
        }}
      >
        {/* The drag surface. Scoped to the handle and title so the body scrolls. */}
        <View {...dragResponder.panHandlers}>
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

          {hasHeader && (
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
                  accessibilityLabelTx="common.close"
                />
              )}
            </View>
          )}
        </View>

        <ScrollView
          onLayout={handleViewportLayout}
          onContentSizeChange={handleContentSizeChange}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={isOverflowing}
          // Lets a short form sit at its natural height while a long one fills
          // the sheet and scrolls.
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
            borderTopColor: footer || isOverflowing ? colors.border : colors.transparent,
            borderTopWidth: footer || isOverflowing ? 1 : 0,
            paddingBottom: Math.max(insets.bottom, SPACING.lg),
            paddingHorizontal: SPACING.xl,
            paddingTop: footer ? SPACING.md : 0,
          }}
        >
          {footer}
        </View>
      </Animated.View>
    </ReactNativeModal>
  );
}
