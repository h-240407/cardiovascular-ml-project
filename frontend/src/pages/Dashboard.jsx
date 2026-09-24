import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import heart from '../assets/anatomical-heart.png'
import { Unavailable } from '../components/AppShell'
import { apiUrl } from '../api'

export default function Dashboard() {
  const [healthStatus, setHealthStatus] = useState(null)
  const [lastResult, setLastResult] = useState(null)

  useEffect(() => {
    fetch(apiUrl('/api/health'))
      .then(r => r.json())
      .then(setHealthStatus)
      .catch(() => setHealthStatus(null))

    // Load last prediction result from sessionStorage if it exists
    const stored = sessionStorage.getItem('cardio_last_result')
    if (stored) {
      try { setLastResult(JSON.parse(stored)) } catch {}
    }
  }, [])

  const rows = [
    {
      name: 'Current prediction',
      detail: 'Model outcome',
      value: lastResult ? (lastResult.prediction === 1 ? 'High Risk' : 'Low Risk') : '—',
      available: !!lastResult,
    },
    {
      name: 'Prediction probability',
      detail: 'Confidence returned by model',
      value: lastResult ? `${lastResult.probability_pct}%` : '—',
      available: !!lastResult,
    },
    {
      name: 'Risk level',
      detail: 'Risk category from model',
      value: lastResult ? lastResult.risk_level : '—',
      available: !!lastResult,
    },
    {
      name: 'Latest assessment',
      detail: 'Most recent completed run',
      value: lastResult ? lastResult.bmi ? `BMI ${lastResult.bmi}` : 'Completed' : '—',
      available: !!lastResult,
    },
  ]

  return (
    <div>
      {/* Hero section */}
      <section className="atlas-grid relative min-h-[760px] overflow-hidden border-b border-border px-5 pb-12 pt-8 sm:px-8 lg:px-12">
        <div className="flex justify-between font-mono text-[10px] uppercase text-muted-foreground">
          <span>(a) — Dashboard</span>
          <span className="flex items-center gap-2">
            <i className="size-1.5 rounded-full bg-primary inline-block" />
            {healthStatus?.model_loaded ? 'Backend connected' : 'Awaiting backend connection'}
          </span>
        </div>
        <div className="relative grid min-h-[650px] items-center lg:grid-cols-12">
          <div className="relative z-10 lg:col-span-7">
            <h1 className="font-display text-[clamp(5rem,12vw,11rem)] uppercase leading-[0.82]">
              <span className="rise-in block">Know</span>
              <span className="rise-in block pl-[.45em] text-primary" style={{ animationDelay: '120ms' }}>Your</span>
              <span className="rise-in block" style={{ animationDelay: '240ms' }}>Heart.</span>
            </h1>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-muted-foreground">
              A composed cardiovascular risk interface powered by Gradient Boosting, Logistic Regression, and AdaBoost.
              {healthStatus?.model_loaded
                ? ' The prediction service is connected and ready.'
                : ' Complete a prediction to populate this dashboard with real results.'}
            </p>
            <Link
              to="/prediction"
              className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              Begin assessment →
            </Link>
          </div>
          <div className="relative mt-8 min-h-[430px] lg:col-span-5 lg:mt-0 lg:h-[650px]">
            <img
              src={heart}
              alt="Anatomical human heart"
              width={1024}
              height={1280}
              className="heart-drift absolute left-1/2 top-1/2 w-[min(92%,560px)] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_35px_25px_color-mix(in_oklab,var(--foreground)_20%,transparent)]"
            />
            <p className="absolute bottom-2 right-0 text-right font-mono text-[9px] uppercase text-muted-foreground">
              Fig. 01<br />
              <span className="text-primary">Anatomical reference</span>
            </p>
          </div>
        </div>
      </section>

      {/* Current prediction rows */}
      <section>
        <div className="flex justify-between px-5 py-4 font-mono text-[10px] uppercase text-muted-foreground sm:px-8 lg:px-12">
          <span>(b) — Current prediction</span>
          <span>{lastResult ? 'Live · source online' : 'No values · run an assessment first'}</span>
        </div>
        {rows.map(({ name, detail, value, available }) => (
          <div key={name} className="data-rule grid gap-3 px-5 py-6 sm:px-8 lg:grid-cols-12 lg:px-12">
            <h2 className="font-display text-3xl uppercase lg:col-span-4">{name}</h2>
            <p className="text-xs text-muted-foreground lg:col-span-4">{detail}</p>
            <span className="font-mono text-sm lg:col-span-2" style={{ color: available ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
              {value}
            </span>
            <span className="lg:col-span-2 lg:text-right">
              {available
                ? <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 font-mono text-[9px] uppercase text-primary">Live</span>
                : <Unavailable />}
            </span>
          </div>
        ))}
      </section>

      {/* CTA section */}
      <section className="border-y border-border bg-foreground px-5 py-12 text-background sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-12">
          <h2 className="font-display text-6xl uppercase leading-none lg:col-span-5">
            {lastResult ? 'Assessment\ncomplete.' : 'The atlas\nawaits a signal.'}
          </h2>
          <div className="lg:col-span-7">
            <p className="max-w-xl text-sm leading-relaxed text-background/65">
              {lastResult
                ? `Your latest assessment returned ${lastResult.risk_level}. Run a new assessment or explore model analytics to understand the prediction.`
                : 'No health records, prediction result, probability, or timestamp are available yet. Connect a real assessment to populate this surface.'}
            </p>
            <Link
              to="/about"
              className="mt-6 inline-flex items-center justify-center rounded-md border border-background/30 px-4 py-2 text-sm font-medium text-background transition-colors hover:border-primary"
            >
              View the pipeline
            </Link>
          </div>
        </div>
      </section>

      {/* Backend status strip */}
      {healthStatus && (
        <div className="flex gap-8 px-5 py-4 font-mono text-[9px] uppercase text-muted-foreground sm:px-8 lg:px-12 border-b border-border">
          <span>Model: {healthStatus.model_type}</span>
          <span>Accuracy: {healthStatus.accuracy}</span>
          <span>F1: {healthStatus.f1_score}</span>
          <span className={healthStatus.model_loaded ? 'text-primary' : 'text-destructive'}>
            {healthStatus.model_loaded ? '● Online' : '○ Offline'}
          </span>
        </div>
      )}
    </div>
  )
}
