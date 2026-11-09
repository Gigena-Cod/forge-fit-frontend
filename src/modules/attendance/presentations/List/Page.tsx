import { useState } from "react";
import { Input, InputType } from "../../../../shared/components/Input/index.ts";
import {
  type TableColumn,
} from "../../../../shared/components/Table/index.ts";
import {
  Text,
  TextColor,
  TextWeight,
} from "../../../../shared/components/Text/index.ts";
import { AttendanceStatus, type Attendance } from "../../models/Attendance.ts";
import { useGetAttendances } from "../hooks/useGetAttendances.ts";
import "./Page.css";
import { PagedTable } from '../../../../shared/components/Table/PagedTable.tsx'
import '../../../../shared/styles/operations.css'

const labels = {
  [AttendanceStatus.Allowed]: "Ingreso permitido",
  [AttendanceStatus.Rejected]: "Ingreso rechazado",
};
function date(value: string) {
  return new Intl.DateTimeFormat("es-AR").format(new Date(`${value}T12:00:00`));
}
const columns: TableColumn<Attendance>[] = [
  {
    id: "member",
    header: "Socio",
    width: "280px",
    render: (item) => (
      <Text as="span" weight={TextWeight.Semibold}>
        {item.memberName}
      </Text>
    ),
  },
  {
    id: "date",
    header: "Fecha",
    width: "180px",
    render: (item) => <Text as="span">{date(item.entryDate)}</Text>,
  },
  {
    id: "time",
    header: "Hora",
    width: "150px",
    render: (item) => <Text as="span">{item.entryTime}</Text>,
  },
  {
    id: "status",
    header: "Estado",
    width: "230px",
    render: (item) => (
      <Text
        as="span"
        weight={TextWeight.Bold}
        color={
          item.status === AttendanceStatus.Allowed
            ? TextColor.Accent
            : TextColor.Danger
        }
      >
        {labels[item.status]}
      </Text>
    ),
  },
];

export function AttendancePage() {
  const [query, setQuery] = useState("");
  const list = useGetAttendances("/attendance", query.trim());
  return (
    <main className="attendance-page">
      <section className="attendance-page__content">
        <div className="attendance-page__intro"> </div>
        <Input
          type={InputType.Search}
          label="Buscar asistencia"
          placeholder="Buscar asistencia..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <PagedTable list={list} label="Asistencias"
          empty={query.trim() ? "No hay asistencias que coincidan con la búsqueda." : "No hay asistencias registradas."}
          columns={columns} getRowId={item => item.id} minWidth={840} />
      </section>
    </main>
  );
}
