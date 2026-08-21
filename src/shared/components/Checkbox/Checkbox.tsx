import type { ChangeEventHandler } from "react";
import { Text, TextSize } from "../Text/index.ts";
import "./Checkbox.css";

type CheckboxProps = {
  id?: string;
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  label: string;
};

export function Checkbox({ id, checked, onChange, label }: CheckboxProps) {
  return (
    <label className="checkbox" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} />
      <span className="checkbox__box" aria-hidden="true">
        ✓
      </span>
      <Text as="span" size={TextSize.Small}>
        {label}
      </Text>
    </label>
  );
}
