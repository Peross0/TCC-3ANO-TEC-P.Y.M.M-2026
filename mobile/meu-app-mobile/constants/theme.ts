/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const paletteBlue = '#4FB3E6';
const paletteGray = '#BFBFBF';
const paletteBlack = '#000000';
const paletteWhite = '#FFFFFF';

export const Colors = {
  light: {
    text: paletteBlack,
    background: paletteWhite,
    surface: paletteWhite,
    line: paletteGray,
    muted: paletteBlack,
    tint: paletteBlue,
    primaryDark: paletteBlack,
    accent: paletteBlue,
    accentWash: paletteGray,
    lime: paletteBlue,
    limeDark: paletteBlack,
    limeWash: paletteGray,
    primaryWash: paletteBlue,
    icon: paletteBlack,
    tabIconDefault: paletteGray,
    tabIconSelected: paletteBlue,
  },
  dark: {
    text: paletteWhite,
    background: paletteBlack,
    surface: paletteBlack,
    line: paletteGray,
    muted: paletteGray,
    tint: paletteBlue,
    primaryDark: paletteWhite,
    accent: paletteBlue,
    accentWash: paletteGray,
    lime: paletteBlue,
    limeDark: paletteBlack,
    limeWash: paletteGray,
    primaryWash: paletteBlue,
    icon: paletteWhite,
    tabIconDefault: paletteGray,
    tabIconSelected: paletteBlue,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
