import type { MouseEventHandler, ReactNode } from "react";
import "./Button.css";

type ButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

export function Button({
  children,
  disabled = false,
  type = "button",
  onClick,
  className,
}: ButtonProps) {
  return (
    <button
      className={`button${className ? ` ${className}` : ""}`}
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
