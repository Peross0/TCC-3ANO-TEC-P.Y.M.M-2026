/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const paletteBlue = '#5A7FFF';
const paletteInk = '#1E1D25';
const paletteGray = '#667085';
const paletteWhite = '#FFFFFF';

export const Colors = {
  light: {
    text: paletteInk,
    ink: paletteInk,
    inkSoft: '#475467',
    background: '#F5F7FB',
    surface: paletteWhite,
    surfaceSoft: '#EFF2F8',
    line: '#D9DFEA',
    muted: paletteGray,
    tint: paletteBlue,
    primaryDark: paletteInk,
    accent: paletteBlue,
    accentWash: '#E8EEFF',
    lime: paletteBlue,
    limeDark: paletteInk,
    limeWash: '#E8EEFF',
    primaryWash: '#E8EEFF',
    icon: paletteInk,
    tabIconDefault: '#98A2B3',
    tabIconSelected: paletteBlue,
    danger: '#B42318',
  },
  dark: {
    text: '#F3F4F6',
    ink: '#F3F4F6',
    inkSoft: '#D0D5DD',
    background: '#101218',
    surface: '#191B24',
    surfaceSoft: '#20232E',
    line: '#343843',
    muted: '#A9B0BE',
    tint: '#7D99FF',
    primaryDark: '#F3F4F6',
    accent: '#7D99FF',
    accentWash: '#282F48',
    lime: '#7D99FF',
    limeDark: '#F3F4F6',
    limeWash: '#282F48',
    primaryWash: '#282F48',
    icon: '#F3F4F6',
    tabIconDefault: '#A9B0BE',
    tabIconSelected: '#7D99FF',
    danger: '#F97066',
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
