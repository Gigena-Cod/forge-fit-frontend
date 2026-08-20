import './App.css'

function App() {
  return (
    <main className="cover">
      <div className="cover__spine" aria-hidden="true" />
      <p className="cover__eyebrow">FORGEFIT / ATHLETIC ACADEMY</p>

      <section className="cover__title-block">
        <span className="cover__number">01</span>
        <h1>TRAIN WITH<br />INTENT.</h1>
        <div className="cover__rule" />
        <p className="cover__subtitle">Performance is a discipline.</p>
      </section>

      <section className="cover__details">
        <p className="cover__label">FOUNDATION PROGRAM</p>
        <p className="cover__body">A precise framework for strength, conditioning and sustainable athletic progress.</p>
        <div className="cover__chip">2026 EDITION</div>
      </section>
    </main>
  )
}

export default App
