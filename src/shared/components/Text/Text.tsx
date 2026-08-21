import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import {
  TextColor,
  TextSize,
  TextWeight,
  type TextColor as TextColorValue,
  type TextSize as TextSizeValue,
  type TextWeight as TextWeightValue,
} from "./text.types.ts";
import "./Text.css";

type TextProps<T extends ElementType = "p"> = {
  as?: T;
  children: ReactNode;
  size?: TextSizeValue;
  weight?: TextWeightValue;
  color?: TextColorValue;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "color">;

export function Text<T extends ElementType = "p">({
  as,
  children,
  size = TextSize.Medium,
  weight = TextWeight.Regular,
  color = TextColor.Primary,
  className,
  ...props
}: TextProps<T>) {
  const Component = as ?? "p";
  const classes = [
    "text",
    `text--size-${size}`,
    `text--weight-${weight}`,
    `text--color-${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
