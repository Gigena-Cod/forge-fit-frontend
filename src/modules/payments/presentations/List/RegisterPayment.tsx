import { useEffect, useRef, useState, type FormEvent } from "react";
import { getMembers } from "../../../members/services/getMembers.ts";
import { getMemberPayments } from "../../../members/services/getMemberPayments.ts";
import type { Member } from "../../../members/types/member.ts";
import { apiRequest } from "../../../../shared/services/api.ts";
import { Button } from "../../../../shared/components/Button/index.ts";
import { PaymentStatus } from "../../models/Payment.ts";

export function RegisterPayment({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [today] = useState(() => new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Argentina/Cordoba", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date()));

  useEffect(() => {
    const modal = dialog.current!;
    modal.showModal();
    let active = true;
    void getMembers().then(
      (list) => { if (active) setMembers(list); },
      () => { if (active) setLoadError(true); },
    );
    return () => { active = false; modal.close(); };
  }, []);

  function cancel() {
    if (saving.current) return;
    dialog.current?.close();
    onCancel();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current) return;
    const fields = new FormData(event.currentTarget);
    const memberId = String(fields.get("memberId") ?? "");
    const period = String(fields.get("period") ?? "");
    const amount = Number(fields.get("amount"));
    const paymentDate = String(fields.get("paymentDate") ?? "");
    const paymentMethod = String(fields.get("paymentMethod") ?? "");
    if (!memberId || !/^\d{4}-(0[1-9]|1[0-2])$/.test(period) || !Number.isSafeInteger(amount) || amount < 1 || !paymentDate || !paymentMethod) {
      setError("Completá los datos del pago con un importe entero mayor a cero.");
      return;
    }
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      const matches = (await getMemberPayments(memberId, period)).filter((payment) => payment.period === period);
      if (matches.length > 1) {
        setError("Hay varios registros para ese socio y período. Revisá el historial antes de cobrar.");
        return;
      }
      const existing = matches[0];
      if (existing?.status === PaymentStatus.Paid) {
        setError("Ese período ya está pagado.");
        return;
      }
      await apiRequest(existing ? `/payments/${encodeURIComponent(existing.id)}` : "/payments", {
        method: existing ? "PUT" : "POST",
        body: JSON.stringify({ memberId, period, amount, paymentDate, paymentMethod, status: PaymentStatus.Paid }),
      });
      dialog.current?.close();
      onSaved();
    } catch {
      setError("No pudimos confirmar el pago. Revisá los datos y volvé a intentar.");
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  return <dialog ref={dialog} className="payment-dialog" aria-labelledby="register-payment-title" onCancel={(event) => {
    event.preventDefault();
    cancel();
  }}>
    <div className="operations-intro">
    <h2 id="register-payment-title">Registrar pago</h2>
    {loadError && <p role="alert">No pudimos cargar los socios. Cerrá el formulario y volvé a abrirlo.</p>}
    {!members && !loadError && <p role="status">Cargando socios…</p>}
    {members?.length === 0 && <p>Primero agregá un socio desde Socios.</p>}
    <form className="operations-intro" onSubmit={submit}>
      <fieldset className="operations-fields payment-fields" disabled={busy || !members?.length}>
        <label><span id="payment-member-label">Socio</span><select aria-labelledby="payment-member-label" name="memberId" required defaultValue="">
          <option value="" disabled>Seleccioná un socio</option>
          {members?.map(member => <option value={member.id} key={member.id}>{member.name} · {member.dni}</option>)}
        </select></label>
        <label>Período<input name="period" type="month" required defaultValue={today.slice(0, 7)} /></label>
        <label>Importe (ARS)<input name="amount" type="number" min="1" step="1" required /></label>
        <label>Fecha de pago<input name="paymentDate" type="date" required defaultValue={today} /></label>
        <label><span id="payment-method-label">Medio de pago</span><select aria-labelledby="payment-method-label" name="paymentMethod" required defaultValue="">
          <option value="" disabled>Seleccioná un medio</option>
          <option value="CASH">Efectivo</option>
          <option value="TRANSFER">Transferencia</option>
          <option value="CARD">Tarjeta</option>
        </select></label>
      </fieldset>
      {error && <p className="operations-error" role="alert">{error}</p>}
      <div className="operations-actions">
        <Button type="submit" disabled={busy || !members?.length}>{busy ? "Guardando…" : "Guardar pago"}</Button>
        <button type="button" className="operations-secondary" disabled={busy} onClick={cancel}>Cancelar</button>
      </div>
    </form>
    </div>
  </dialog>;
}
