import { useState } from "react";
import {
  Popup,
  PopupSize,
} from "../../../../../shared/components/Popup/index.ts";
import type { Member } from "../../../types/member.ts";
import { useUpdateMember } from "../../hooks/useUpdateMember.ts";
import { emptyMemberPayload, getMemberFormErrors, MemberForm } from "../MemberForm/MemberForm.tsx";
import { useErrorToast } from '../../../../../shared/hooks/useErrorToast.ts'
type Props = {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onUpdated: (member: Member) => void;
};
export function UpdateMemberPopup({
  isOpen,
  member,
  onClose,
  onUpdated,
}: Props) {
  const [value, setValue] = useState(
    member
      ? { ...emptyMemberPayload, ...member, birthDate: member.birthDate ?? "" }
      : emptyMemberPayload,
  );
  const { updateMember, isLoading, error } = useUpdateMember();
  useErrorToast(error)
  const memberId = member?.id;
  if (!member) return null;
  const valid = Object.keys(getMemberFormErrors(value)).length === 0;
  async function submit() {
    if (!memberId) return;
    const updated = await updateMember(memberId, value);
    if (updated) {
      onUpdated(updated);
      onClose();
    }
  }
  return (
    <Popup
      isOpen={isOpen}
      title="Editar socio"
      description="Actualizá la información del socio."
      primaryButtonText="Guardar cambios"
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
