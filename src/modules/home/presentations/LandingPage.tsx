import firstDayArt from "../../../assets/guia-jornada.jpg";
import qrArt from "../../../assets/guia-qr.jpg";
import reportsArt from "../../../assets/guia-reportes.jpg";
import "./LandingPage.css";
import { useEffect, useState } from "react";
import clientReceptionPhoto from "../../../assets/cliente-pulso.jpg";
import receptionPhoto from "../../../assets/landing-recepcion.jpg";
import trainingPhoto from "../../../assets/cliente-umbral.jpg";
import strengthPhoto from "../../../assets/cliente-distrito.jpg";
import managementPhoto from "../../../assets/landing-gestion.jpg";

const features = [
  {
    title: "Controlá el ingreso con QR",
    description: "Escaneá la credencial del socio en recepción, verificá su acceso y registrá su asistencia.",
    preview: "Control de ingreso",
    rows: [["Credencial", "QR validado"], ["Socio", "Lucía Pérez"], ["Resultado", "Ingreso registrado"]],
  },
  {
    title: "Gestioná socios y pagos",
    description: "Buscá a un socio por nombre o DNI y abrí su ficha para consultar su estado, historial de pagos y asistencias.",
    preview: "Socios y pagos",
    rows: [["Lucía Pérez", "Al día"], ["Mateo Ruiz", "Pendiente"], ["Sofía Díaz", "Al día"]],
  },
  {
    title: "Entendé la asistencia",
    description: "Consultá el historial de ingresos y usá los reportes para entender cómo se mueve tu gimnasio.",
    preview: "Reporte semanal",
    rows: [["Lunes", "42 ingresos"], ["Martes", "35 ingresos"], ["Miércoles", "48 ingresos"]],
  },
];

const experiences = [
  { gym: "Pulso Norte", role: "Valentina · Recepción", quote: "Cuando llegan varios socios a la vez, escaneo cada credencial y veo enseguida el resultado del ingreso.", image: clientReceptionPhoto },
  { gym: "Umbral Fuerza", role: "Martín · Administración", quote: "Para preparar la semana, filtro el reporte y veo qué días registraron más ingresos.", image: trainingPhoto },
  { gym: "Distrito Barra", role: "Camila · Propietaria", quote: "Cada persona del equipo usa su propia cuenta. Puedo asignar los permisos según lo que necesita hacer.", image: strengthPhoto },
];

function wrapExperience(index: number) {
  return (index + experiences.length) % experiences.length;
}

const guides = [
  { title: "Tu primera jornada", description: "Ubicá las fichas de socios y las herramientas de recepción.", image: firstDayArt },
  { title: "Credenciales QR", description: "Conocé el flujo para emitir una credencial y escanearla en recepción.", image: qrArt },
  { title: "Cuotas y reportes", description: "Encontrá cuotas pendientes y revisá los ingresos por período.", image: reportsArt },
];

export function LandingPage() {
  const [{ index: experienceIndex, direction }, setExperience] = useState({ index: 0, direction: 1 });
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  function moveExperience(step: number) {
    setExperience(({ index }) => ({ index: wrapExperience(index + step), direction: step }));
  }

  useEffect(() => {
    if (paused || hovered || focused) return;
    const timer = window.setTimeout(() => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setExperience(({ index }) => ({ index: wrapExperience(index + 1), direction: 1 }));
      }
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [experienceIndex, paused, hovered, focused]);

  return (
    <div className="landing">
      <header className="landing__header landing__wrap">
        <a className="landing__brand" href="/">ForgeFit</a>
        <nav aria-label="Navegación pública">
          <a href="#funciones">Funciones</a>
          <a href="#experiencias">Experiencias</a>
          <a href="#preguntas">Preguntas frecuentes</a>
        </nav>
        <a className="landing__cta" href="/auth/login">Iniciar sesión</a>
      </header>

      <main>
        <section className="landing__hero landing__wrap">
          <p className="landing__label">ForgeFit / Gestión de gimnasios</p>
          <h1>Gestioná tu gimnasio desde un solo lugar.</h1>
          <div className="landing__hero-copy">
            <p className="landing__label">Ingreso QR + Socios + Reportes</p>
            <div>
              <p>Validá el ingreso en recepción, consultá cuotas pendientes y seguí la asistencia de tus socios desde un mismo panel.</p>
              <a className="landing__cta" href="/auth/login">Iniciar sesión <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <div className="landing__preview landing__hero-panel">
            <p className="landing__label">Vista del panel · Datos de ejemplo</p>
            <h2>Resumen del gimnasio</h2>
            <dl className="landing__metrics">
              <div><dt>Socios activos</dt><dd>128</dd></div>
              <div><dt>Ingresos de hoy</dt><dd>42</dd></div>
              <div><dt>Cuotas pendientes</dt><dd>8</dd></div>
            </dl>
            <aside className="landing__status">
              <span aria-hidden="true">✓</span>
              <div><strong>Ingreso autorizado</strong><small>Credencial QR validada</small></div>
            </aside>
          </div>
        </section>

        <section className="landing__wrap landing__section">
          <p className="landing__label">El día a día del gimnasio</p>
          <h2>La ficha del socio reúne lo que antes buscabas en varias planillas</h2>
          <p>Cuando alguien llega a entrenar, recepción necesita saber quién es, si puede ingresar y si su asistencia quedó registrada. Para administración, el mismo historial sirve para revisar cuotas y consultar los movimientos del gimnasio por período.</p>
        </section>

        <section className="landing__wrap landing__section" id="funciones">
          <p className="landing__label">Funciones</p>
          <h2>Del ingreso al cierre del día</h2>
          {features.map(({ title, description, preview, rows }, index) => (
            <article className="landing__feature" key={title}>
              <div>
                <p className="landing__label">0{index + 1}</p>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <div className="landing__preview">
                <p className="landing__label">Vista de ejemplo</p>
                <h4>{preview}</h4>
                <dl className="landing__rows">
                  {rows.map(([label, value]) => (
                    <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                  ))}
                </dl>
                {index === 2 && <div className="landing__bars" aria-hidden="true"><i /><i /><i /></div>}
              </div>
            </article>
          ))}
        </section>

        <section className="landing__wrap landing__section">
          <p className="landing__label">En recepción</p>
          <h2>Así funciona el ingreso por QR</h2>
          <figure className="landing__story">
            <img src={receptionPhoto} alt="Un socio acerca su teléfono al lector de recepción" width="1672" height="941" loading="lazy" />
            <figcaption>
              <h3>Cuando llegan varios socios juntos</h3>
              <p>Cada persona presenta su credencial y recepción ve el resultado de la validación en pantalla. Si aparece una cuota vencida, el equipo puede abrir la ficha del socio y consultar su historial para responderle en el momento.</p>
            </figcaption>
          </figure>
          <ol className="landing__workflow">
            <li><h3>Emití la credencial</h3><p>Desde la ficha del socio, un usuario autorizado puede generar su QR o renovarlo si necesita reemplazarlo.</p></li>
            <li><h3>Escaneá en recepción</h3><p>Cuando el socio presenta la credencial, leé el código con la cámara o con un lector USB en modo teclado.</p></li>
            <li><h3>Consultá el resultado</h3><p>ForgeFit confirma el ingreso y registra la asistencia cuando está autorizado. Si hay un problema, como una cuota vencida, muestra el motivo.</p></li>
          </ol>
        </section>

        <section className="landing__wrap landing__section">
          <p className="landing__label">Para el equipo</p>
          <h2>Cada rol tiene su espacio de trabajo</h2>
          <div className="landing__workflow">
            <article><h3>Recepción</h3><p>Validá accesos, buscá fichas y consultá el historial cuando un socio tiene una duda sobre su cuota o sus ingresos.</p></article>
            <article><h3>Administración</h3><p>Consultá altas de socios, estados de pago e ingresos por día. Usá los filtros de reportes para revisar un período específico.</p></article>
            <article><h3>Propietario</h3><p>Administrá las cuentas del equipo y asigná el rol que corresponde a cada persona.</p></article>
          </div>
          <figure className="landing__story landing__story--reverse">
            <img src={managementPhoto} alt="Un encargado revisa su computadora en el mostrador del gimnasio" width="1672" height="941" loading="lazy" />
            <figcaption>
              <h3>Cuando toca revisar la semana</h3>
              <p>En Reportes, administración puede filtrar por fechas para ver qué días tuvieron más ingresos, revisar las altas de socios y consultar el estado de los pagos del período.</p>
            </figcaption>
          </figure>
        </section>

        <section className="landing__section" id="experiencias" aria-labelledby="experiencias-titulo"
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
          <div className="landing__wrap">
            <p className="landing__label">Casos ficticios</p>
            <h2 id="experiencias-titulo">Así se viviría ForgeFit en otros gimnasios</h2>
          </div>
          <div className="landing__carousel" data-direction={direction}>
            {experiences.map((experience, index) => {
              const position = index === experienceIndex ? "current" : index === wrapExperience(experienceIndex - 1) ? "previous" : "next";
              return (
                <figure className="landing__experience" key={experience.gym} data-position={position} aria-hidden={position !== "current"}>
                  <figcaption>
                    <p className="landing__label">Experiencia ficticia</p>
                    <h3>{experience.gym}</h3>
                    <p className="landing__experience-role">{experience.role}</p>
                  </figcaption>
                  <div className="landing__experience-media">
                    <img src={experience.image} alt="" width="1536" height="1024" loading="lazy" />
                    <blockquote>“{experience.quote}”</blockquote>
                  </div>
                </figure>
              );
            })}
          </div>
          <div className="landing__wrap landing__carousel-controls">
            <span className="landing__carousel-count" aria-live={paused || focused ? "polite" : "off"}>{experienceIndex + 1} de {experiences.length}</span>
            <button type="button" aria-label="Experiencia anterior" onClick={() => moveExperience(-1)}>←</button>
            <button type="button" aria-label="Experiencia siguiente" onClick={() => moveExperience(1)}>→</button>
            <button type="button" onClick={() => setPaused((value) => !value)}>{paused ? "Reanudar" : "Pausar"}</button>
          </div>
        </section>

        <section className="landing__wrap landing__section" id="preguntas">
          <h2>Preguntas frecuentes</h2>
          <details>
            <summary>¿Cómo se registra un ingreso?</summary>
            <p>Desde Control de ingreso, escaneá la credencial QR del socio para validar el acceso.</p>
          </details>
          <details>
            <summary>¿Dónde consulto el estado de las cuotas?</summary>
            <p>En Pagos podés consultar el estado de las cuotas. Para ver el historial de una persona, abrí su ficha desde Socios.</p>
          </details>
          <details>
            <summary>¿Necesito un lector USB?</summary>
            <p>Podés usar la cámara del equipo, un lector USB configurado como teclado o pegar el contenido de la credencial en el campo de ingreso.</p>
          </details>
          <details>
            <summary>¿Necesito una cuenta para usar el panel?</summary>
            <p>Sí. Iniciá sesión con tu cuenta de ForgeFit para acceder a las herramientas de gestión.</p>
          </details>
        </section>

      </main>

      <footer className="landing__footer">
        <div className="landing__wrap">
          <section className="landing__guide-section" aria-labelledby="guias-titulo">
            <p className="landing__label">Centro de recursos</p>
            <h2 id="guias-titulo">Guías de ForgeFit</h2>
            <div className="landing__guide-grid">
              {guides.map((guide, index) => (
                <article className="landing__guide" key={guide.title}>
                  <div className="landing__guide-art" aria-hidden="true">
                    <span>0{index + 1}</span>
                    <img src={guide.image} alt="" loading="lazy" />
                  </div>
                  <div className="landing__guide-copy">
                    <h3>{guide.title}</h3>
                    <p>{guide.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section className="landing__partners">
            <p className="landing__label">Partners de muestra</p>
            <h2>El ecosistema ForgeFit</h2>
            <ul aria-label="Marcas ficticias">
              <li>◆ Nexo Acceso</li>
              <li>▰ Base Equipamiento</li>
              <li>◈ Circuito Fitness</li>
            </ul>
          </section>
          <section className="landing__newsletter">
            <div>
              <h3>Newsletter de ForgeFit</h3>
              <p>Novedades del panel, guías para recepción y consejos para gestionar tu gimnasio.</p>
            </div>
            <div className="landing__newsletter-badge"><span aria-hidden="true">✉</span> Edición de muestra</div>
          </section>
          <div className="landing__footer-columns">
            <div>
              <p className="landing__brand">ForgeFit</p>
              <p>Gestión para el día a día de tu gimnasio.</p>
            </div>
            <div>
              <h3>Producto</h3>
              <ul><li>Control de ingreso QR</li><li>Socios y cuotas</li><li>Historial de asistencia</li><li>Reportes de actividad</li><li>Usuarios y permisos</li></ul>
            </div>
            <div>
              <h3>Recursos</h3>
              <ul><li>Primeros pasos</li><li>Guías de ForgeFit</li><li>Preguntas frecuentes</li></ul>
            </div>
          </div>
          <p className="landing__footer-bottom">© {new Date().getFullYear()} ForgeFit</p>
        </div>
      </footer>
    </div>
  );
}
