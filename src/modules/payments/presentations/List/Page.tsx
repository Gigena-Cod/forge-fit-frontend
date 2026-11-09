import { useState } from "react";
import { RegisterPayment } from "./RegisterPayment.tsx";
import "../../../../shared/styles/operations.css";
import { TablePagination } from "../../../../shared/components/Table/TablePagination.tsx";
import { Input, InputType } from "../../../../shared/components/Input/index.ts";
import {
  Table,
  type TableColumn,
} from "../../../../shared/components/Table/index.ts";
import {
  Text,
  TextColor,
  TextWeight,
} from "../../../../shared/components/Text/index.ts";
import {
  PaymentMethod,
  PaymentStatus,
  type Payment,
} from "../../models/Payment.ts";
import { useGetPayments } from "../hooks/useGetPayments.ts";
import "./Page.css";

const labels = {
  [PaymentStatus.Paid]: "Pagado",
  [PaymentStatus.Pending]: "Pendiente",
  [PaymentStatus.Overdue]: "Vencido",
};
const methods = {
  [PaymentMethod.Cash]: "Efectivo",
  [PaymentMethod.Transfer]: "Transferencia",
  [PaymentMethod.Card]: "Tarjeta",
};
const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});
function date(value: string | null) {
  if (!value) return "-";
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime())
    ? "-"
    : new Intl.DateTimeFormat("es-AR", { timeZone: "UTC" }).format(parsedDate);
}
function period(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}-01T12:00:00`));
}
const columns: TableColumn<Payment>[] = [
  {
    id: "member",
    header: "Socio",
    width: "220px",
    render: (item) => (
      <Text as="span" weight={TextWeight.Semibold}>
        {item.memberName}
      </Text>
    ),
  },
  {
    id: "period",
    header: "Período",
    width: "175px",
    render: (item) => <Text as="span">{period(item.period)}</Text>,
  },
  {
    id: "amount",
    header: "Monto",
    width: "145px",
    render: (item) => <Text as="span">{money.format(item.amount)}</Text>,
  },
  {
    id: "date",
    header: "Fecha de pago",
    width: "165px",
    render: (item) => <Text as="span">{date(item.paymentDate)}</Text>,
  },
  {
    id: "status",
    header: "Estado",
    width: "145px",
    render: (item) => (
      <Text
        as="span"
        weight={TextWeight.Bold}
        color={
          item.status === PaymentStatus.Overdue
            ? TextColor.Danger
            : item.status === PaymentStatus.Paid
              ? TextColor.Accent
              : TextColor.Secondary
        }
      >
        {labels[item.status]}
      </Text>
    ),
  },
  {
    id: "method",
    header: "Medio de pago",
    width: "170px",
    render: (item) => (
      <Text as="span">
        {item.paymentMethod ? methods[item.paymentMethod] : "-"}
      </Text>
    ),
  },
];

export function PaymentsPage() {
  const [revision, setRevision] = useState(0);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [query, setQuery] = useState("");
  const { data, isLoading, error } = useGetPayments(page, query.trim(), revision);
  return (
    <main className="payments-page">
      <section className="payments-page__content operations-content">
        <div className="payments-page__toolbar">
          <Input
            type={InputType.Search}
            label="Buscar pago"
            placeholder="Buscar pago..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
              setSaved(false);
            }}
          />
          <button className="button" type="button" aria-haspopup="dialog" onClick={() => setShowForm(true)}>Registrar pago</button>
        </div>
        {showForm && <RegisterPayment onCancel={() => setShowForm(false)} onSaved={() => {
          setShowForm(false);
          setQuery("");
          setPage(1);
          setSaved(true);
          setRevision((value) => value + 1);
        }} />}
        {saved && !showForm && <p className="operations-success" role="status">Pago registrado.</p>}
        {isLoading && (
          <p role="status">Cargando pagos…</p>
        )}
        {error && <div className="operations-intro">
          <p role="alert">No pudimos obtener los pagos.</p>
          <button type="button" className="operations-secondary" onClick={() => setRevision(value => value + 1)}>Reintentar</button>
        </div>}
        {data && (data.items.length ? (
            <Table
              columns={columns}
              data={data.items}
              getRowId={(item) => item.id}
              minWidth={1020}
            />
          ) : (
            <Text color={TextColor.Secondary}>{page > 1 ? "Esta página ya no tiene pagos." : query.trim() ? "No hay pagos que coincidan con la búsqueda." : "No hay pagos registrados."}</Text>
          ))}
        {data?.items.length ? <TablePagination {...data} label="Pagos" count={data.items.length} onPage={setPage} />
          : page > 1 && <button type="button" className="operations-secondary" disabled={isLoading} onClick={() => setPage(value => value - 1)}>Anterior</button>}
      </section>
    </main>
  );
}
