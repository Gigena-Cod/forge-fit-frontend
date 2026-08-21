import {
  Popup,
  PopupSize,
} from "../../../../../shared/components/Popup/index.ts";
import type { Member } from "../../../types/member.ts";
import { useCreateMember } from "../../hooks/useCreateMember.ts";
import { emptyMemberPayload, getMemberFormErrors, MemberForm } from "../MemberForm/MemberForm.tsx";
import { useState } from "react";
import { useErrorToast } from '../../../../../shared/hooks/useErrorToast.ts'
type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (member: Member) => void;
};
export function CreateMemberPopup({ isOpen, onClose, onCreated }: Props) {
  const [value, setValue] = useState(emptyMemberPayload);
  const { createMember, isLoading, error } = useCreateMember();
  useErrorToast(error)
  const valid = Object.keys(getMemberFormErrors(value)).length === 0;
  async function submit() {
    const member = await createMember(value);
    if (member) {
      onCreated(member);
      setValue(emptyMemberPayload);
      onClose();
    }
  }
  return (
    <Popup
      isOpen={isOpen}
      title="Nuevo socio"
      description="Registrá los datos del nuevo socio."
      primaryButtonText="Crear socio"
      secondaryButtonText="Cancelar"
      onPrimaryAction={submit}
      onSecondaryAction={onClose}
      onClose={onClose}
      isPrimaryLoading={isLoading}
      isPrimaryDisabled={!valid}
      size={PopupSize.Large}
    >
      <MemberForm value={value} onChange={setValue} />
    </Popup>
  );
}
