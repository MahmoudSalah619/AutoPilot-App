import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

/** Design reference device (iPhone X class), used by the scaling helpers. */
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const widthScale = WIDTH / BASE_WIDTH;
const heightScale = HEIGHT / BASE_HEIGHT;

/**
 * Scales a size against device width, damped so text stays readable on
 * tablets. Prefer the fixed `SPACING` tokens; reach for this only when a
 * dimension genuinely has to track screen size.
 */
export function moderateScale(size: number, factor = 0.5) {
  const scaled = size + (widthScale * size - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
}

export function horizontalScale(width: number) {
  return Math.round(PixelRatio.roundToNearestPixel(widthScale * width));
}

export function verticalScale(height: number) {
  return Math.round(PixelRatio.roundToNearestPixel(heightScale * height));
}

/** Height of the custom tab bar, excluding the bottom safe-area inset. */
export const TAB_BAR_HEIGHT = 64;

/** Height of the in-app screen header, excluding the top safe-area inset. */
export const HEADER_HEIGHT = 56;

export const IS_SMALL_DEVICE = WIDTH < 360;
export const IS_TABLET = WIDTH >= 768;

const METRICS = {
  screenWidth: WIDTH,
  screenHeight: HEIGHT,
  tabBarHeight: TAB_BAR_HEIGHT,
  headerHeight: HEADER_HEIGHT,
  isSmallDevice: IS_SMALL_DEVICE,
  isTablet: IS_TABLET,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
};

export default METRICS;
