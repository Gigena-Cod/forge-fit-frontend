/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "../Button/index.ts";
import { Text, TextColor, TextSize, TextWeight } from "../Text/index.ts";
import "./Popup.css";

export const PopupSize = { Small: "small", Large: "large" } as const;
export type PopupSize = (typeof PopupSize)[keyof typeof PopupSize];

type PopupProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  primaryButtonText: string;
  secondaryButtonText: string;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  onClose: () => void;
  isPrimaryLoading?: boolean;
  isPrimaryDisabled?: boolean;
  size?: PopupSize;
};

export function Popup({
  isOpen,
  title,
  description,
  children,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryAction,
  onSecondaryAction,
  onClose,
  isPrimaryLoading = false,
  isPrimaryDisabled = false,
  size = PopupSize.Small,
}: PopupProps) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      let frame = requestAnimationFrame(() => {
        setIsRendered(true);
        frame = requestAnimationFrame(() => setIsVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    const frame = requestAnimationFrame(() => setIsVisible(false));
    const timeout = window.setTimeout(() => setIsRendered(false), 180);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [isOpen]);

  if (!isRendered) return null;

  const stateClass = isVisible
    ? "popup-backdrop--visible"
    : "popup-backdrop--closing";
  return (
    <div
      className={`popup-backdrop ${stateClass}`}
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className={`popup popup--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="popup__close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <Text as="h2" size={TextSize.XLarge} weight={TextWeight.ExtraBold}>
          {title}
        </Text>
        {description && <Text color={TextColor.Secondary}>{description}</Text>}
        <div className="popup__body">{children}</div>
        <div className="popup__actions">
          <button
            className="popup__secondary"
            type="button"
            onClick={onSecondaryAction}
          >
            <Text as="span" weight={TextWeight.Bold}>
              {secondaryButtonText}
            </Text>
          </button>
          <Button
            type="button"
            disabled={isPrimaryDisabled || isPrimaryLoading}
            onClick={onPrimaryAction}
          >
            <Text as="span" weight={TextWeight.Bold}>
              {isPrimaryLoading ? "Guardando..." : primaryButtonText}
            </Text>
          </Button>
        </div>
      </section>
    </div>
  );
}
