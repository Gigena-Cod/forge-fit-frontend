export const TextSize = {
  Small: "small",
  Medium: "medium",
  Large: "large",
  XLarge: "x-large",
  XXLarge: "xx-large",
} as const;

export type TextSize = (typeof TextSize)[keyof typeof TextSize];

export const TextWeight = {
  Regular: "regular",
  Medium: "medium",
  Semibold: "semibold",
  Bold: "bold",
  ExtraBold: "extra-bold",
} as const;

export type TextWeight = (typeof TextWeight)[keyof typeof TextWeight];

export const TextColor = {
  Primary: "primary",
  Secondary: "secondary",
  Accent: "accent",
  Danger: "danger",
} as const;

export type TextColor = (typeof TextColor)[keyof typeof TextColor];
