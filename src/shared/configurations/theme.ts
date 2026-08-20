/**
 * Tokens de diseño de ForgeFit.
 *
 * Los componentes pueden importar este objeto cuando necesiten un valor en
 * TypeScript. Para los estilos visuales usá las variables CSS `--ff-*`, que
 * se registran con `applyTheme()` al iniciar la aplicación.
 */
export const theme = {
  colors: {
    surface: '#131313',
    surfaceDim: '#131313',
    surfaceBright: '#393939',
    surfaceContainerLowest: '#0e0e0e',
    surfaceContainerLow: '#1c1b1b',
    surfaceContainer: '#20201f',
    surfaceContainerHigh: '#2a2a2a',
    surfaceContainerHighest: '#353535',
    onSurface: '#e5e2e1',
    onSurfaceVariant: '#e9bcb5',
    inverseSurface: '#e5e2e1',
    inverseOnSurface: '#313030',
    outline: '#b08781',
    outlineVariant: '#5f3f3a',
    surfaceTint: '#ffb4a8',
    primary: '#ffb4a8',
    onPrimary: '#690000',
    primaryContainer: '#e60000',
    onPrimaryContainer: '#fff7f5',
    inversePrimary: '#c00000',
    secondary: '#c6c6c6',
    onSecondary: '#303030',
    secondaryContainer: '#474747',
    onSecondaryContainer: '#b5b5b5',
    tertiary: '#c6c6c7',
    onTertiary: '#2f3131',
    tertiaryContainer: '#717272',
    onTertiaryContainer: '#f8f8f8',
    background: '#131313',
    onBackground: '#e5e2e1',
    error: '#ffb4ab',
    onError: '#690005',
    errorContainer: '#93000a',
    onErrorContainer: '#ffdad6',
    primaryFixed: '#ffdad4',
    primaryFixedDim: '#ffb4a8',
    onPrimaryFixed: '#410000',
    onPrimaryFixedVariant: '#930100',
    secondaryFixed: '#e2e2e2',
    secondaryFixedDim: '#c6c6c6',
    onSecondaryFixed: '#1b1b1b',
    onSecondaryFixedVariant: '#474747',
    tertiaryFixed: '#e2e2e2',
    tertiaryFixedDim: '#c6c6c7',
    onTertiaryFixed: '#1a1c1c',
    onTertiaryFixedVariant: '#454747',
    surfaceVariant: '#353535',
  },
  typography: {
    display: "'Lexend', Arial, sans-serif",
    body: "'Newsreader', Georgia, serif",
    label: "'Lexend', Arial, sans-serif",
  },
  spacing: {
    pageMargin: '24mm',
    gutter: '8mm',
    stackSmall: '4px',
    stackMedium: '16px',
    stackLarge: '48px',
    blockPadding: '32px',
  },
  radius: '0px',
} as const

type TokenGroup = Record<string, string>

function setCssVariables(group: TokenGroup, prefix: string) {
  for (const [name, value] of Object.entries(group)) {
    document.documentElement.style.setProperty(`--ff-${prefix}-${toKebabCase(name)}`, value)
  }
}

function toKebabCase(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

/** Registra los tokens para que cualquier archivo .css normal pueda usarlos. */
export function applyTheme() {
  setCssVariables(theme.colors, 'color')
  setCssVariables(theme.typography, 'font')
  setCssVariables(theme.spacing, 'space')
  document.documentElement.style.setProperty('--ff-radius', theme.radius)
}
