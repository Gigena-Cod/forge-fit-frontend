import { useState } from "react";
import {
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
import { usePagedList } from "../../../shared/hooks/usePagedList.ts";
import { PagedTable } from "../../../shared/components/Table/PagedTable.tsx";
import "../../../shared/styles/operations.css";
import { MemberRowActions } from "./subcomponents/MemberRowActions/MemberRowActions.tsx";
import { CreateMemberPopup } from "./subcomponents/CreateMemberPopup/CreateMemberPopup.tsx";
import { UpdateMemberPopup } from "./subcomponents/UpdateMemberPopup/UpdateMemberPopup.tsx";
import { DeleteMemberPopup } from "./subcomponents/DeleteMemberPopup/DeleteMemberPopup.tsx";
import "./Page.css";

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
  const [query, setQuery] = useState("");
  const list = usePagedList<Member>("/members", query.trim());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [memberToUpdate, setMemberToUpdate] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

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

          <PagedTable
            columns={columns}
            list={list}
            label="Socios"
            empty={query.trim() ? "No hay socios que coincidan con la búsqueda." : "No hay socios registrados."}
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
      </section>
      <CreateMemberPopup
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={list.reload}
      />
      <UpdateMemberPopup
        key={`update-${memberToUpdate?.id ?? "none"}`}
        isOpen={Boolean(memberToUpdate)}
        member={memberToUpdate}
        onClose={() => setMemberToUpdate(null)}
        onUpdated={list.reload}
      />
      <DeleteMemberPopup
        key={`delete-${memberToDelete?.id ?? "none"}`}
        isOpen={Boolean(memberToDelete)}
        member={memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onDeleted={list.reload}
      />
    </main>
  );
}
