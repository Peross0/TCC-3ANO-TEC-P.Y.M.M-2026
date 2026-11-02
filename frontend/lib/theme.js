const semanticColors = {
  background: '#0D1117',
  surface: '#161B22',
  surfaceElevated: '#1C2330',
  border: '#626F7E',
  textPrimary: '#E6EDF3',
  textSecondary: '#9BA7B4',
  textMuted: '#8B96A3',
  primary: '#4DB6E8',
  primaryHover: '#70C8F0',
  onPrimary: '#0B1220',
  success: '#3FB950',
  successSurface: '#14291D',
  warning: '#D29922',
  warningSurface: '#302715',
  danger: '#F85149',
  dangerSurface: '#321B1B',
  overlay: 'rgba(0, 0, 0, 0.72)',
  shadow: 'rgba(0, 0, 0, 0.32)',
};

export const theme = {
  colors: semanticColors,
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    6: 24,
    8: 32,
  },
  radii: {
    small: 8,
    medium: 12,
    large: 16,
    extraLarge: 24,
    pill: 999,
  },
  typography: {
    title: 30,
    subtitle: 20,
    body: 14,
    caption: 12,
  },
  shadows: {
    card: {
      boxShadow: `0px 8px 20px ${semanticColors.shadow}`,
    },
  },
};

export const colors = {
  ...semanticColors,
  ink: semanticColors.textPrimary,
  inkSoft: semanticColors.textSecondary,
  muted: semanticColors.textMuted,
  paper: semanticColors.background,
  surfaceSoft: semanticColors.surfaceElevated,
  line: semanticColors.border,
  primaryDark: semanticColors.textPrimary,
  primaryWash: semanticColors.surfaceElevated,
  accent: semanticColors.primary,
  accentWash: semanticColors.surfaceElevated,
  lime: semanticColors.success,
  limeDark: semanticColors.success,
  limeWash: semanticColors.successSurface,
};

export const radii = theme.radii;
