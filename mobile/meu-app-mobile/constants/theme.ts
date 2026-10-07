/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#00A8C6';
const tintColorDark = '#40C0CB';
const tintColorStrong = '#007F96';

export const Colors = {
  light: {
    text: '#1E343B',
    background: '#F9F2E7',
    surface: '#FFFFFF',
    line: '#E7DED0',
    muted: '#788B8F',
    tint: tintColorLight,
    primaryDark: tintColorStrong,
    accent: '#40C0CB',
    accentWash: '#E5F7F8',
    lime: '#AEE239',
    limeDark: '#8FBE00',
    limeWash: '#F1F8DD',
    primaryWash: '#E2F5F7',
    icon: '#52686D',
    tabIconDefault: '#788B8F',
    tabIconSelected: tintColorStrong,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    surface: '#202426',
    line: '#394144',
    muted: '#9BA1A6',
    tint: tintColorDark,
    primaryDark: '#40C0CB',
    accent: '#40C0CB',
    accentWash: '#17383B',
    lime: '#AEE239',
    limeDark: '#8FBE00',
    limeWash: '#303A1B',
    primaryWash: '#17383B',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
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
