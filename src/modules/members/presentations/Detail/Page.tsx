import { useState } from "react";
import { Button } from "../../../../shared/components/Button/index.ts";
import { Input, InputType } from "../../../../shared/components/Input/index.ts";
import {
  Table,
  type TableColumn,
} from "../../../../shared/components/Table/index.ts";
import {
  Text,
  TextColor,
  TextSize,
  TextWeight,
} from "../../../../shared/components/Text/index.ts";
import { MembershipStatus, type Member } from "../../types/member.ts";
import {
  PaymentStatus,
  type Payment,
} from "../../../payments/models/Payment.ts";
import { useGetMember } from "./hooks/useGetMember.ts";
import { useGetMemberPayments } from "./hooks/useGetMemberPayments.ts";
import { useGetMemberAttendances } from "../../../attendance/presentations/hooks/useGetMemberAttendances.ts";
import {
  AttendanceStatus,
  type Attendance,
} from "../../../attendance/models/Attendance.ts";
import "./Page.css";

function formatDate(value: string | null, includeTime = false) {
  if (!value) return "Sin registros";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(`${value}${value.includes("T") ? "" : "T12:00:00"}`));
}

function membershipLabel(status: MembershipStatus) {
  return status === MembershipStatus.Active ? "Activo" : "Inactivo";
}

function formatPaymentDate(value: string | null) {
  if (!value) return "-";
  const parsedDate = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return "-";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

const paymentColumns: TableColumn<Payment>[] = [
  {
    id: "period",
    header: "Período",
    width: "180px",
    render: (payment) => (
      <Text as="span" weight={TextWeight.Semibold}>
        {payment.period}
      </Text>
    ),
  },
  {
    id: "method",
    header: "Método",
    width: "170px",
    render: (payment) => <Text as="span">{payment.paymentMethod ?? "-"}</Text>,
  },
  {
    id: "date",
    header: "Fecha",
    width: "145px",
    render: (payment) => (
      <Text as="span">{formatPaymentDate(payment.paymentDate)}</Text>
    ),
  },
  {
    id: "amount",
    header: "Importe",
    width: "150px",
    render: (payment) => (
      <Text as="span">
        {new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "ARS",
          maximumFractionDigits: 0,
        }).format(payment.amount)}
      </Text>
    ),
  },
  {
    id: "status",
    header: "Estado",
    width: "145px",
    render: (payment) => (
      <Text
        as="span"
        weight={TextWeight.Bold}
        color={
          payment.status === PaymentStatus.Paid
            ? TextColor.Accent
            : payment.status === PaymentStatus.Overdue
              ? TextColor.Danger
              : TextColor.Secondary
        }
      >
        {payment.status === PaymentStatus.Paid
          ? "Pagado"
          : payment.status === PaymentStatus.Overdue
            ? "Vencido"
            : "Pendiente"}
      </Text>
    ),
  },
];

function formatAttendanceDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

const attendanceColumns: TableColumn<Attendance>[] = [
  {
    id: "date",
    header: "Fecha",
    width: "190px",
    render: (attendance) => (
      <Text as="span">{formatAttendanceDate(attendance.entryDate)}</Text>
    ),
  },
  {
    id: "time",
    header: "Hora",
    width: "160px",
    render: (attendance) => <Text as="span">{attendance.entryTime}</Text>,
  },
  {
    id: "status",
    header: "Estado",
    width: "260px",
    render: (attendance) => (
      <Text
        as="span"
        weight={TextWeight.Bold}
        color={
          attendance.status === AttendanceStatus.Allowed
            ? TextColor.Accent
            : TextColor.Danger
        }
      >
        {attendance.status === AttendanceStatus.Allowed
          ? "Ingreso permitido"
          : "Ingreso rechazado"}
      </Text>
    ),
  },
];

function MemberDetailFields({ member }: { member: Member }) {
  return (
    <div className="member-detail__grid">
      <section className="member-detail__section">
        <Text as="h2" size={TextSize.Large} weight={TextWeight.Bold}>
          Datos personales
        </Text>
        <Input
          id="member-name"
          label="Nombre completo"
          value={member.name}
          readOnly
        />
        <Input
          id="member-dni"
          label="DNI"
          type={InputType.Text}
          value={member.dni}
          readOnly
        />
        <Input
          id="member-phone"
          label="Teléfono"
          type={InputType.Tel}
          value={member.phone}
          readOnly
        />
        <Input
          id="member-email"
          label="Email"
          type={InputType.Email}
          value={member.email}
          readOnly
        />
      </section>

      <section className="member-detail__section member-detail__section--membership">
        <Text as="h2" size={TextSize.Large} weight={TextWeight.Bold}>
          Información de membresía
        </Text>
        <Input
          id="member-registration-date"
          label="Fecha de alta"
          value={formatDate(member.registrationDate)}
          readOnly
        />
        <Input
          id="member-status"
          label="Estado de cuota"
          value={membershipLabel(member.membershipStatus)}
          readOnly
        />
        <Input
          id="member-last-entry"
          label="Último ingreso"
          value={formatDate(member.lastEntry, true)}
          readOnly
        />
      </section>
    </div>
  );
}

export function MemberDetailPage() {
  const memberId =
    window.location.pathname.split("/").filter(Boolean).at(-1) ?? "";
  const { member, isLoading, error } = useGetMember(memberId);
  const {
    payments,
    isLoading: isLoadingPayments,
    error: paymentsError,
  } = useGetMemberPayments(memberId);
  const {
    attendances,
    isLoading: isLoadingAttendances,
    error: attendancesError,
  } = useGetMemberAttendances(memberId);
  const [activeTab, setActiveTab] = useState<
    "information" | "payments" | "attendance"
  >("information");
  const recentAttendances = [...attendances]
    .sort((left, right) =>
      `${right.entryDate} ${right.entryTime}`.localeCompare(
        `${left.entryDate} ${left.entryTime}`,
      ),
    )
    .slice(0, 5);
  const goBack = () => window.location.assign("/members");

  return (
    <main className="member-detail-page">
      <div className="member-detail-page__content">
        {isLoading && (
          <Text color={TextColor.Secondary}>
            Cargando información del socio...
          </Text>
        )}
        {error && (
          <section className="member-detail-page__feedback">
            <Text as="h2" size={TextSize.Large} weight={TextWeight.Bold}>
              {error === "Member not found"
                ? "Socio no encontrado."
                : "No pudimos obtener la información del socio."}
            </Text>
            <Button type="button" onClick={goBack}>
              <Text as="span" weight={TextWeight.Bold}>
                Volver a socios
              </Text>
            </Button>
          </section>
        )}
        {member && (
          <>
            <div
              className="member-detail-page__tabs"
              role="tablist"
              aria-label="Información del socio"
            >
              <button
                className={`member-detail-page__tab${activeTab === "information" ? " member-detail-page__tab--active" : ""}`}
                type="button"
                role="tab"
                aria-selected={activeTab === "information"}
                onClick={() => setActiveTab("information")}
              >
                <Text as="span" weight={TextWeight.Bold}>
                  Información
                </Text>
              </button>
              <button
                className={`member-detail-page__tab${activeTab === "payments" ? " member-detail-page__tab--active" : ""}`}
                type="button"
                role="tab"
                aria-selected={activeTab === "payments"}
                onClick={() => setActiveTab("payments")}
              >
                <Text as="span" weight={TextWeight.Bold}>
                  Pagos
                </Text>
              </button>
              <button
                className={`member-detail-page__tab${activeTab === "attendance" ? " member-detail-page__tab--active" : ""}`}
                type="button"
                role="tab"
                aria-selected={activeTab === "attendance"}
                onClick={() => setActiveTab("attendance")}
              >
                <Text as="span" weight={TextWeight.Bold}>
                  Asistencias
                </Text>
              </button>
            </div>
            {activeTab === "information" && (
              <MemberDetailFields member={member} />
            )}
            {activeTab === "payments" && (
              <section className="member-detail-page__payments" role="tabpanel">
                <Text as="h2" size={TextSize.Large} weight={TextWeight.Bold}>
                  Historial de pagos
                </Text>
                {isLoadingPayments && (
                  <Text color={TextColor.Secondary}>Cargando pagos...</Text>
                )}
                {paymentsError && (
                  <Text color={TextColor.Danger}>
                    No pudimos obtener los pagos del socio.
                  </Text>
                )}
                {!isLoadingPayments && !paymentsError && (
                  <Table
                    columns={paymentColumns}
                    data={payments}
                    getRowId={(payment) => payment.id}
                    minWidth={800}
                  />
                )}
              </section>
            )}
            {activeTab === "attendance" && (
              <section className="member-detail-page__payments" role="tabpanel">
                <div>
                  <Text as="h2" size={TextSize.Large} weight={TextWeight.Bold}>
                    Asistencias
                  </Text>
                  <Text color={TextColor.Secondary}>
                    Últimos ingresos registrados del socio.
                  </Text>
                </div>
                {isLoadingAttendances && (
                  <Text color={TextColor.Secondary}>
                    Cargando asistencias...
                  </Text>
                )}
                {attendancesError && (
                  <Text color={TextColor.Danger}>
                    No pudimos obtener las asistencias.
                  </Text>
                )}
                {!isLoadingAttendances &&
                  !attendancesError &&
                  (recentAttendances.length ? (
                    <Table
                      columns={attendanceColumns}
                      data={recentAttendances}
                      getRowId={(attendance) => attendance.id}
                      minWidth={610}
                    />
                  ) : (
                    <Text color={TextColor.Secondary}>
                      Este socio todavía no registra asistencias.
                    </Text>
                  ))}
              </section>
            )}
          </>
        )}
        {member && (
          <Button
            className="member-detail-page__back"
            type="button"
            onClick={goBack}
          >
            <Text as="span" weight={TextWeight.Bold}>
              Volver a socios
            </Text>
          </Button>
        )}
      </div>
    </main>
  );
}
