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
    accentWash: '#EAF7FD',
    lime: paletteBlue,
    limeDark: paletteBlack,
    limeWash: '#F1F5F9',
    primaryWash: '#EAF7FD',
    icon: paletteBlack,
    tabIconDefault: paletteGray,
    tabIconSelected: paletteBlue,
  },
  dark: {
    text: '#F3F7FC',
    background: '#101822',
    surface: '#182433',
    line: '#344253',
    muted: '#B7C5D4',
    tint: paletteBlue,
    primaryDark: '#D8F3FF',
    accent: paletteBlue,
    accentWash: '#213C4B',
    lime: paletteBlue,
    limeDark: '#101822',
    limeWash: '#213C4B',
    primaryWash: '#213C4B',
    icon: '#F3F7FC',
    tabIconDefault: '#B7C5D4',
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
