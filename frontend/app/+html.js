import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

import { colors } from '../lib/theme';

export default function Root({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content={colors.background} />
        <meta name="color-scheme" content="dark" />
        <style>{`
          html, body, #root { min-height: 100%; margin: 0; background: ${colors.background}; }
          body { color: ${colors.textPrimary}; font-family: Arial, Helvetica, sans-serif; }
          :focus-visible { outline: 2px solid ${colors.primary}; outline-offset: 2px; }
          [role="button"], [role="link"] { transition: background-color 150ms ease, border-color 150ms ease, opacity 150ms ease; }
          [role="button"]:not([aria-disabled="true"]):hover { filter: brightness(1.08); }
          [role="button"]:not([aria-disabled="true"]):active { opacity: 0.78; }
          [role="button"][aria-disabled="true"] { opacity: 0.55; }
        `}</style>
      </head>
      <body>
        <ScrollViewStyleReset />
        {children}
      </body>
    </html>
  );
}
