import {
  Text,
  TextWeight,
} from "../../../../../shared/components/Text/index.ts";
import type { Member } from "../../../types/member.ts";
import "./MemberRowActions.css";
type Props = {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
};
export function MemberRowActions({ member, onEdit, onDelete }: Props) {
  return (
    <div className="member-row-actions">
      <a className="member-row-actions__action" href={`/members/${member.id}`}>
        <Text as="span" weight={TextWeight.Bold}>
          Ver detalle
        </Text>
      </a>
      <button
        type="button"
        className="member-row-actions__action"
        onClick={() => onEdit(member)}
      >
        <Text as="span" weight={TextWeight.Bold}>
          Editar
        </Text>
      </button>
      <button
        type="button"
        className="member-row-actions__action member-row-actions__delete"
        onClick={() => onDelete(member)}
      >
        <Text as="span" weight={TextWeight.Bold}>
          Eliminar
        </Text>
      </button>
    </div>
  );
}
