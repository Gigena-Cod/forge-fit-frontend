import { useMemo, useState } from "react";
import {
  Table,
  type TableColumn,
} from "../../../shared/components/Table/index.ts";
import { Input, InputType } from "../../../shared/components/Input/index.ts";
import {
  Text,
  TextColor,
  TextSize,
  TextWeight,
} from "../../../shared/components/Text/index.ts";
import { MembershipStatus, type Member } from "../types/member.ts";
import { useGetMembers } from "./hooks/useGetMembers.ts";
import { MemberRowActions } from "./subcomponents/MemberRowActions/MemberRowActions.tsx";
import { CreateMemberPopup } from "./subcomponents/CreateMemberPopup/CreateMemberPopup.tsx";
import { UpdateMemberPopup } from "./subcomponents/UpdateMemberPopup/UpdateMemberPopup.tsx";
import { DeleteMemberPopup } from "./subcomponents/DeleteMemberPopup/DeleteMemberPopup.tsx";
import "./Page.css";
import { useErrorToast } from '../../../shared/hooks/useErrorToast.ts'

function formatDate(value: string | null) {
  if (!value) return "Sin registros";

  const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function Status({ status }: { status: MembershipStatus }) {
  const isActive = status === MembershipStatus.Active;
  return (
    <span className={`member-status member-status--${status.toLowerCase()}`}>
      <Text
        as="span"
        size={TextSize.Small}
        weight={TextWeight.Bold}
        color={isActive ? TextColor.Accent : TextColor.Secondary}
      >
        {isActive ? "Activo" : "Inactivo"}
      </Text>
    </span>
  );
}

const columns: TableColumn<Member>[] = [
  {
    id: "name",
    header: "Socio",
    width: "170px",
    render: (member) => (
      <Text as="span" weight={TextWeight.Semibold}>
        {member.name}
      </Text>
    ),
  },
  {
    id: "dni",
    header: "DNI",
    width: "110px",
    render: (member) => <Text as="span">{member.dni}</Text>,
  },
  {
    id: "phone",
    header: "Teléfono",
    width: "140px",
    render: (member) => <Text as="span">{member.phone}</Text>,
  },
  {
    id: "registrationDate",
    header: "Fecha de alta",
    width: "155px",
    render: (member) => (
      <Text as="span">{formatDate(member.registrationDate)}</Text>
    ),
  },
  {
    id: "membershipStatus",
    header: "Estado de cuota",
    width: "150px",
    render: (member) => <Status status={member.membershipStatus} />,
  },
  {
    id: "email",
    header: "Email",
    width: "260px",
    render: (member) => <Text as="span">{member.email}</Text>,
  },
  {
    id: "lastEntry",
    header: "Último ingreso",
    width: "165px",
    render: (member) => <Text as="span">{formatDate(member.lastEntry)}</Text>,
  },
];

export function MembersPage() {
  const { members, isLoading, error, addMember, replaceMember, removeMember } =
    useGetMembers();
  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [memberToUpdate, setMemberToUpdate] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  useErrorToast(error)
  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return members;

    return members.filter((member) =>
      [member.name, member.dni, member.email].some((value) =>
        value.toLocaleLowerCase().includes(normalizedQuery),
      ),
    );
  }, [members, query]);

  return (
    <main className="members-page">
      <section className="members-page__content" aria-label="Listado de socios">
        <div className="members-page__actions">
          <Input
            type={InputType.Search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            label="Buscar socio"
            placeholder="Buscar socio..."
          />
          <button
            className="members-page__create"
            type="button"
            onClick={() => setIsCreateOpen(true)}
          >
            <Text as="span" weight={TextWeight.Bold} color={TextColor.Primary}>
              Crear socio
            </Text>
          </button>
        </div>

        {isLoading && (
          <Text color={TextColor.Secondary}>Cargando socios...</Text>
        )}
        {!isLoading && !error && (
          <Table
            columns={columns}
            data={filteredMembers}
            getRowId={(member) => member.id}
            minWidth={1150}
            renderExpandedRow={(member) => (
              <MemberRowActions
                member={member}
                onEdit={setMemberToUpdate}
                onDelete={setMemberToDelete}
              />
            )}
          />
        )}
      </section>
      <CreateMemberPopup
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={addMember}
      />
      <UpdateMemberPopup
        key={memberToUpdate?.id ?? "none"}
        isOpen={Boolean(memberToUpdate)}
        member={memberToUpdate}
        onClose={() => setMemberToUpdate(null)}
        onUpdated={replaceMember}
      />
      <DeleteMemberPopup
        key={memberToDelete?.id ?? "none"}
        isOpen={Boolean(memberToDelete)}
        member={memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onDeleted={removeMember}
      />
    </main>
  );
}
