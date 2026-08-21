import { useState } from "react";
import {
  Input,
  InputType,
} from "../../../../../shared/components/Input/index.ts";
import { Popup } from "../../../../../shared/components/Popup/index.ts";
import {
  Text,
  TextColor,
  TextWeight,
} from "../../../../../shared/components/Text/index.ts";
import type { Member } from "../../../types/member.ts";
import { useDeleteMember } from "../../hooks/useDeleteMember.ts";
import { useErrorToast } from '../../../../../shared/hooks/useErrorToast.ts'
type Props = {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onDeleted: (memberId: string) => void;
};
export function DeleteMemberPopup({
  isOpen,
  member,
  onClose,
  onDeleted,
}: Props) {
  const { deleteMember, isLoading, error } = useDeleteMember();
  useErrorToast(error)
  const [confirmation, setConfirmation] = useState("");
  const confirmationText = member ? `DELETE ${member.name}` : "";

  async function submit() {
    if (!member || confirmation !== confirmationText) return;
    if (await deleteMember(member.id)) {
      onDeleted(member.id);
      onClose();
    }
  }

  return (
    <Popup
      isOpen={isOpen}
      title="Eliminar socio"
      description="Esta acción no se puede deshacer."
      primaryButtonText="Eliminar socio"
      secondaryButtonText="Cancelar"
      onPrimaryAction={submit}
      onSecondaryAction={onClose}
      onClose={onClose}
      isPrimaryLoading={isLoading}
      isPrimaryDisabled={!member || confirmation !== confirmationText}
    >
      <Text>
        Estás por eliminar a{" "}
        <Text as="span" weight={TextWeight.Bold}>
          {member?.name ?? "este socio"}
        </Text>
        .
      </Text>
      <Text color={TextColor.Secondary}>
        Al confirmar, se eliminarán permanentemente sus pagos, asistencias y
        toda la información asociada a este socio.
      </Text>
      <Input
        type={InputType.Text}
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
        label={`Para confirmar, escribe: ${confirmationText}`}
        placeholder={confirmationText}
        autoComplete="off"
      />
    </Popup>
  );
}
