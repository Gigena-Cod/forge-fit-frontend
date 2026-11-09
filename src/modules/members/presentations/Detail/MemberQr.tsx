import { useEffect, useState } from "react";
import { toDataURL } from "qrcode";
import { Button } from "../../../../shared/components/Button/index.ts";
import { ApiError, apiRequest } from "../../../../shared/services/api.ts";

type Credential = { qrPayload: string; issuedAt: string };
type QrState =
  | { kind: "loading" | "missing" }
  | { kind: "error"; message: string }
  | { kind: "ready"; image: string; issuedAt: string };

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 403) return "No tenés permiso para gestionar la credencial.";
    if (error.code === "MEMBER_NOT_FOUND") return "No encontramos al socio.";
  }
  return "No pudimos consultar la credencial QR.";
}

async function renderCredential({ qrPayload, issuedAt }: Credential): Promise<QrState> {
  const image = await toDataURL(qrPayload, { width: 256 });
  return { kind: "ready", image, issuedAt };
}

export function MemberQr({ memberId }: { memberId: string }) {
  const path = `/members/${encodeURIComponent(memberId)}/qr`;
  const [state, setState] = useState<QrState>({ kind: "loading" });
  const [query, setQuery] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void apiRequest<Credential>(path, { signal: controller.signal, cache: "no-store" })
      .then(renderCredential)
      .then((result) => {
        if (!controller.signal.aborted) setState(result);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 404 && error.code === "QR_NOT_ASSIGNED") {
          setState({ kind: "missing" });
        } else {
          setState({ kind: "error", message: errorMessage(error) });
        }
      });
    return () => controller.abort();
  }, [path, query]);

  function reload() {
    setState({ kind: "loading" });
    setQuery((previous) => previous + 1);
  }

  async function issue(rotate: boolean) {
    if (rotate && !window.confirm("¿Renovar la credencial? El QR anterior dejará de funcionar.")) return;
    setState({ kind: "loading" });
    setNotice("");
    try {
      const credential = await apiRequest<Credential>(path, {
        method: "POST",
        body: JSON.stringify(rotate ? { rotate: true } : {}),
        cache: "no-store",
      });
      setState(await renderCredential(credential));
      setNotice(rotate ? "Credencial renovada." : "Credencial generada.");
    } catch (error) {
      if (error instanceof ApiError && (error.status === 403 || error.code === "MEMBER_NOT_FOUND")) {
        setState({ kind: "error", message: errorMessage(error) });
        return;
      }
      setNotice("No pudimos confirmar el cambio. Volvemos a consultar la credencial vigente.");
      reload();
    }
  }

  return (
    <section className="member-detail__section" aria-labelledby="member-qr-title">
      <h2 id="member-qr-title">Credencial QR</h2>
      <div role="status">{notice || (state.kind === "loading" ? "Cargando credencial…" : "")}</div>
      {state.kind === "error" && (
        <>
          <p role="alert">{state.message}</p>
          <Button type="button" onClick={reload}>Reintentar consulta</Button>
        </>
      )}
      {state.kind === "missing" && (
        <>
          <p>Este socio todavía no tiene una credencial.</p>
          <Button type="button" onClick={() => void issue(false)}>Generar QR</Button>
        </>
      )}
      {state.kind === "ready" && (
        <>
          <img src={state.image} alt="Código QR de ingreso del socio" width={256} height={256} className="member-detail__qr" />
          <p>Emitida el {new Date(state.issuedAt).toLocaleString("es-AR")}</p>
          <Button type="button" onClick={() => void issue(true)}>Renovar QR</Button>
        </>
      )}
    </section>
  );
}
