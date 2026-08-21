import { useMemo, useState } from "react";
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
import { useErrorToast } from '../../../../shared/hooks/useErrorToast.ts'

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
  const parsedDate = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? "-"
    : new Intl.DateTimeFormat("es-AR").format(parsedDate);
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
  const { payments, isLoading, error } = useGetPayments();
  const [query, setQuery] = useState("");
  useErrorToast(error)
  const filteredPayments = useMemo(() => {
    const value = query.trim().toLocaleLowerCase();
    return value
      ? payments.filter((item) =>
          [item.memberName, item.period, labels[item.status]].some((field) =>
            field.toLocaleLowerCase().includes(value),
          ),
        )
      : payments;
  }, [payments, query]);
  return (
    <main className="payments-page">
      <section className="payments-page__content">
        <Input
          type={InputType.Search}
          label="Buscar pago"
          placeholder="Buscar pago..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {isLoading && (
          <Text color={TextColor.Secondary}>Cargando pagos...</Text>
        )}
        {!isLoading &&
          !error &&
          (filteredPayments.length ? (
            <Table
              columns={columns}
              data={filteredPayments}
              getRowId={(item) => item.id}
              minWidth={1020}
            />
          ) : (
            <Text color={TextColor.Secondary}>No hay pagos registrados.</Text>
          ))}
      </section>
    </main>
  );
}
