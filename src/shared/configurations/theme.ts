/**
 * Tokens de diseño de ForgeFit.
 *
 * Los componentes pueden importar este objeto cuando necesiten un valor en
 * TypeScript. Para los estilos visuales usá las variables CSS `--ff-*`, que
 * se registran con `applyTheme()` al iniciar la aplicación.
 */
export const theme = {
  colors: {
    surface: "#ffffff",
    surfaceDim: "#f5f6f7",
    surfaceBright: "#ffffff",
    surfaceContainerLowest: "#ffffff",
    surfaceContainerLow: "#f8f8f8",
    surfaceContainer: "#f3f4f5",
    surfaceContainerHigh: "#ebedef",
    surfaceContainerHighest: "#e1e4e7",
    onSurface: "#240b0b",
    onSurfaceVariant: "#637182",
    inverseSurface: "#240b0b",
    inverseOnSurface: "#ffffff",
    outline: "#d6dbe0",
    outlineVariant: "#e8ebed",
    surfaceTint: "#e60000",
    primary: "#e60000",
    onPrimary: "#ffffff",
    primaryContainer: "#e60000",
    onPrimaryContainer: "#ffffff",
    inversePrimary: "#ffb4a8",
    secondary: "#637182",
    onSecondary: "#ffffff",
    secondaryContainer: "#e8ebed",
    onSecondaryContainer: "#240b0b",
    tertiary: "#64748b",
    onTertiary: "#ffffff",
    tertiaryContainer: "#e7edf4",
    onTertiaryContainer: "#240b0b",
    background: "#ffffff",
    onBackground: "#240b0b",
    error: "#b42318",
    onError: "#ffffff",
    errorContainer: "#fee4e2",
    onErrorContainer: "#7a271a",
    primaryFixed: "#ffe1de",
    primaryFixedDim: "#ffb4a8",
    onPrimaryFixed: "#410000",
    onPrimaryFixedVariant: "#930100",
    secondaryFixed: "#e8ebed",
    secondaryFixedDim: "#cbd2d9",
    onSecondaryFixed: "#240b0b",
    onSecondaryFixedVariant: "#4a5562",
    tertiaryFixed: "#e7edf4",
    tertiaryFixedDim: "#cbd5e1",
    onTertiaryFixed: "#240b0b",
    onTertiaryFixedVariant: "#475569",
    surfaceVariant: "#f3f4f5",
  },
  typography: {
    display: "'Rethink Sans', Arial, sans-serif",
    body: "'Rethink Sans', Arial, sans-serif",
    label: "'Rethink Sans', Arial, sans-serif",
  },
  spacing: {
    pageMargin: "24mm",
    gutter: "8mm",
    stackSmall: "4px",
    stackMedium: "16px",
    stackLarge: "48px",
    blockPadding: "32px",
  },
  radius: "0px",
} as const;

type TokenGroup = Record<string, string>;

function setCssVariables(group: TokenGroup, prefix: string) {
  for (const [name, value] of Object.entries(group)) {
    document.documentElement.style.setProperty(
      `--ff-${prefix}-${toKebabCase(name)}`,
      value,
    );
  }
}

function toKebabCase(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/** Registra los tokens para que cualquier archivo .css normal pueda usarlos. */
export function applyTheme() {
  setCssVariables(theme.colors, "color");
  setCssVariables(theme.typography, "font");
  setCssVariables(theme.spacing, "space");
  document.documentElement.style.setProperty("--ff-radius", theme.radius);
}
