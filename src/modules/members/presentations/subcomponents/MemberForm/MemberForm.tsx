/* eslint-disable react-refresh/only-export-components */
import {
  Input,
  InputType,
} from "../../../../../shared/components/Input/index.ts";
import {
  Text,
  TextSize,
  TextWeight,
} from "../../../../../shared/components/Text/index.ts";
import { MembershipStatus } from "../../../types/member.ts";
import type { MemberPayload } from "../../../types/memberPayload.ts";
import "./MemberForm.css";
export const emptyMemberPayload: MemberPayload = {
  name: "",
  dni: "",
  birthDate: "",
  phone: "",
  email: "",
  registrationDate: new Date().toISOString().slice(0, 10),
  membershipStatus: MembershipStatus.Active,
};
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
export function getMemberFormErrors(value: MemberPayload) {
  const errors: Partial<Record<keyof MemberPayload, string>> = {};
  if (!value.name.trim()) errors.name = "El nombre es requerido.";
  if (!value.dni.trim()) errors.dni = "El DNI es requerido.";
  if (value.birthDate && !datePattern.test(value.birthDate)) errors.birthDate = "Usá el formato AAAA-MM-DD.";
  if (!value.phone.trim()) errors.phone = "El teléfono es requerido.";
  if (!emailPattern.test(value.email)) errors.email = "Ingresá un email válido.";
  if (!datePattern.test(value.registrationDate)) errors.registrationDate = "Usá el formato AAAA-MM-DD.";
  return errors;
}
type Props = { value: MemberPayload; onChange: (value: MemberPayload) => void };
export function MemberForm({ value, onChange }: Props) {
  const errors = getMemberFormErrors(value);
  const set = <K extends keyof MemberPayload>(key: K, next: MemberPayload[K]) =>
    onChange({ ...value, [key]: next });
  return (
    <div className="member-form">
      <section>
        <Text as="h3" size={TextSize.Large} weight={TextWeight.Bold}>
          Datos personales
        </Text>
        <Input
          id="member-form-name"
          label="Nombre completo"
          value={value.name}
          onChange={(e) => set("name", e.target.value)}
          error={Boolean(errors.name)}
          helperText={errors.name}
        />
        <Input
          id="member-form-dni"
          label="DNI"
          value={value.dni}
          onChange={(e) => set("dni", e.target.value)}
          error={Boolean(errors.dni)}
          helperText={errors.dni}
        />
        <Input
          id="member-form-birth"
          label="Fecha de nacimiento"
          type={InputType.Date}
          value={value.birthDate}
          onChange={(e) => set("birthDate", e.target.value)}
          error={Boolean(errors.birthDate)}
          helperText={errors.birthDate}
        />
        <Input
          id="member-form-phone"
          label="Teléfono"
          type={InputType.Tel}
          value={value.phone}
          onChange={(e) => set("phone", e.target.value)}
          error={Boolean(errors.phone)}
          helperText={errors.phone}
        />
        <Input
          id="member-form-email"
          label="Email"
          type={InputType.Email}
          value={value.email}
          onChange={(e) => set("email", e.target.value)}
          error={Boolean(errors.email)}
          helperText={errors.email}
        />
      </section>
      <section className="member-form__membership">
        <Text as="h3" size={TextSize.Large} weight={TextWeight.Bold}>
          Información de membresía
        </Text>
        <Input
          id="member-form-registration"
          label="Fecha de alta"
          type={InputType.Date}
          value={value.registrationDate}
          onChange={(e) => set("registrationDate", e.target.value)}
          error={Boolean(errors.registrationDate)}
          helperText={errors.registrationDate}
        />
        <label className="member-form__select-label">
          <Text as="span" size={TextSize.Small} weight={TextWeight.Medium}>
            Estado
          </Text>
          <select
            value={value.membershipStatus}
            onChange={(e) =>
              set("membershipStatus", e.target.value as MembershipStatus)
            }
          >
            <option value={MembershipStatus.Active}>Activo</option>
            <option value={MembershipStatus.Inactive}>Inactivo</option>
          </select>
        </label>
      </section>
    </div>
  );
}
