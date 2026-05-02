import FontFamily from './FontFamily';

export const Typography = {
  h1: {
    fontFamily: FontFamily.cosmica_600,
    fontSize: 40,
    lineHeight: 48, // 40 * 1.2
    letterSpacing: -0.8, // 40 * -0.02
  },
  h2: {
    fontFamily: FontFamily.cosmica_500,
    fontSize: 32,
    lineHeight: 41.6, // 32 * 1.3
    letterSpacing: -0.32, // 32 * -0.01
  },
  h3: {
    fontFamily: FontFamily.cosmica_500,
    fontSize: 24,
    lineHeight: 33.6, // 24 * 1.4
    letterSpacing: 0,
  },
  bodyLg: {
    fontFamily: FontFamily.cosmica_400,
    fontSize: 18,
    lineHeight: 28.8, // 18 * 1.6
    letterSpacing: 0,
  },
  bodyMd: {
    fontFamily: FontFamily.cosmica_400,
    fontSize: 16,
    lineHeight: 24, // 16 * 1.5
    letterSpacing: 0,
  },
  dataMono: {
    fontFamily: FontFamily.cosmica_500,
    fontSize: 14,
    lineHeight: 19.6, // 14 * 1.4
    letterSpacing: 0.28, // 14 * 0.02
  },
  labelSm: {
    fontFamily: FontFamily.cosmica_600,
    fontSize: 12,
    lineHeight: 12, // 12 * 1
    letterSpacing: 0.6, // 12 * 0.05
  },
};
