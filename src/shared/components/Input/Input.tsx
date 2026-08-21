import { useId, type ChangeEventHandler, type ReactNode } from "react";
import { Text, TextColor, TextSize, TextWeight } from "../Text/index.ts";
import { InputType, type InputType as InputTypeValue } from "./input.types.ts";
import "./Input.css";

type InputProps = {
  id?: string;
  value?: string;
  defaultValue?: string;
  type?: InputTypeValue;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  helperText?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onStartIconClick?: () => void;
  onEndIconClick?: () => void;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  autoComplete?: string;
  name?: string;
};

function IconSlot({
  position,
  icon,
  onClick,
}: {
  position: "start" | "end";
  icon: ReactNode;
  onClick?: () => void;
}) {
  if (onClick) {
    return (
      <button
        className={`input__icon input__icon--${position}`}
        type="button"
        onClick={onClick}
      >
        {icon}
      </button>
    );
  }

  return (
    <span className={`input__icon input__icon--${position}`} aria-hidden="true">
      {icon}
    </span>
  );
}

export function Input({
  id,
  value,
  defaultValue,
  type = InputType.Text,
  label,
  placeholder,
  disabled = false,
  readOnly = false,
  error = false,
  helperText,
  startIcon,
  endIcon,
  onStartIconClick,
  onEndIconClick,
  onChange,
  autoComplete,
  name,
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputClassName = `input__control${startIcon ? " input__control--has-start-icon" : ""}${endIcon ? " input__control--has-end-icon" : ""}`;

  return (
    <div
      className={`input${error ? " input--error" : ""}${disabled ? " input--disabled" : ""}`}
    >
      {label && (
        <label htmlFor={inputId}>
          <Text as="span" size={TextSize.Small} weight={TextWeight.Medium}>
            {label}
          </Text>
        </label>
      )}
      <div className="input__field">
        {startIcon && (
          <IconSlot
            position="start"
            icon={startIcon}
            onClick={onStartIconClick}
          />
        )}
        <input
          id={inputId}
          name={name}
          value={value}
          defaultValue={defaultValue}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onChange={onChange}
          autoComplete={autoComplete}
          className={inputClassName}
          aria-invalid={error || undefined}
          aria-describedby={helperText ? `${inputId}-helper` : undefined}
        />
        {endIcon && (
          <IconSlot position="end" icon={endIcon} onClick={onEndIconClick} />
        )}
      </div>
      {helperText && (
        <Text
          id={`${inputId}-helper`}
          size={TextSize.Small}
          color={error ? TextColor.Danger : TextColor.Secondary}
        >
          {helperText}
        </Text>
      )}
    </div>
  );
}
