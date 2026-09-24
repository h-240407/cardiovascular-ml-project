import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageIntro } from '../components/AppShell'

export default function History() {
  const [history, setHistory] = useState([])
  const [cleared, setCleared] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cardio_history')
      if (raw) {
        setHistory(JSON.parse(raw))
      } else {
        // If there's an existing last result in sessionStorage, seed one entry into history
        const lastResultRaw = sessionStorage.getItem('cardio_last_result')
        const lastFormRaw = sessionStorage.getItem('cardio_form')
        if (lastResultRaw) {
          const res = JSON.parse(lastResultRaw)
          const form = lastFormRaw ? JSON.parse(lastFormRaw) : {}
          const seedItem = {
            id: 'session-seed-1',
            timestamp: new Date().toISOString(),
            dateStr: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            modelUsed: res.model_used || 'Gradient Boosting',
            probabilityPct: res.probability_pct,
            riskLevel: res.risk_level,
            isHighRisk: res.is_high_risk,
            bmi: res.bmi,
            statusMessage: res.status_message,
            recommendations: res.recommendations || [],
            inputs: form,
          }
          setHistory([seedItem])
          localStorage.setItem('cardio_history', JSON.stringify([seedItem]))
        }
      }
    } catch {
      setHistory([])
    }
  }, [])

  function handleClearHistory() {
    if (window.confirm('Are you sure you want to clear your assessment history?')) {
      localStorage.removeItem('cardio_history')
      setHistory([])
      setCleared(true)
      setTimeout(() => setCleared(false), 3000)
    }
  }

  function handleDeleteItem(id) {
    const updated = history.filter(item => item.id !== id)
    setHistory(updated)
    localStorage.setItem('cardio_history', JSON.stringify(updated))
  }

  function handleLoadAssessment(item) {
    if (item.inputs && Object.keys(item.inputs).length > 0) {
      sessionStorage.setItem('cardio_form', JSON.stringify(item.inputs))
    }
    const modelKey = (item.modelUsed || 'gradient_boosting').toLowerCase().replace(/ /g, '_')
    sessionStorage.setItem('cardio_selected_model', modelKey)
    localStorage.setItem('cardio_selected_model', modelKey)
    navigate('/prediction')
  }

  return (
    <div>
      <PageIntro
        index="e"
        label="History"
        title="Past assessments."
        copy="Chronological record of every completed risk assessment. Review past patient profiles, selected models, and calculated probabilities."
      />

      <section className="px-5 py-12 sm:px-8 lg:px-12">
        {/* Header toolbar */}
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase text-muted-foreground">Session Log</p>
            <h2 className="mt-1 font-display text-3xl uppercase">
              {history.length} {history.length === 1 ? 'Recorded Run' : 'Recorded Runs'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="inline-flex items-center rounded-md border border-destructive/40 bg-destructive/5 px-4 py-2 font-mono text-xs uppercase text-destructive hover:bg-destructive/10 transition-colors"
              >
                Clear all history
              </button>
            )}
            <Link
              to="/prediction"
              className="inline-flex items-center rounded-md bg-primary px-5 py-2 font-mono text-xs uppercase text-primary-foreground hover:opacity-90 transition-opacity"
            >
              New assessment →
            </Link>
          </div>
        </div>

        {cleared && (
          <div className="mt-4 border border-primary/30 bg-primary/5 p-4 font-mono text-xs text-primary">
            Assessment history has been cleared.
          </div>
        )}

        {/* Empty state */}
        {history.length === 0 ? (
          <div className="py-20 text-center border-b border-border">
            <span className="text-5xl block mb-4">📋</span>
            <h3 className="font-display text-4xl uppercase">No runs recorded yet</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Run an assessment on the Prediction page to record clinical inputs, selected model inference, and risk outputs here.
            </p>
            <div className="mt-6">
              <Link
                to="/prediction"
                className="inline-flex items-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Go to Assessment →
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {history.map((item, idx) => {
              const isHigh = item.isHighRisk
              const inputs = item.inputs || {}
              return (
                <div key={item.id || idx} className="py-8 grid gap-6 lg:grid-cols-12 items-start">
                  {/* Left: Index & Time */}
                  <div className="lg:col-span-3">
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">
                      Run #{String(history.length - idx).padStart(2, '0')}
                    </span>
                    <p className="font-mono text-xs text-foreground mt-1">{item.dateStr}</p>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-mono text-[9px] uppercase text-primary font-medium">
                      <span>Model:</span>
                      <strong>{item.modelUsed}</strong>
                    </div>
                  </div>

                  {/* Middle: Clinical metrics & Risk */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className={`p-4 rounded border-l-4 flex items-center justify-between ${
                      isHigh ? 'border-destructive bg-destructive/5' : 'border-primary bg-primary/5'
                    }`}>
                      <div>
                        <span className={`font-mono text-[9px] uppercase font-semibold ${
                          isHigh ? 'text-destructive' : 'text-primary'
                        }`}>
                          {item.riskLevel || (isHigh ? 'High Risk' : 'Low Risk')}
                        </span>
                        <p className="font-display text-2xl uppercase mt-0.5">
                          {item.probabilityPct}% Probability
                        </p>
                      </div>
                      <span className="text-3xl">{isHigh ? '⚠️' : '✅'}</span>
                    </div>

                    {/* Patient parameter pills */}
                    {Object.keys(inputs).length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <div className="bg-card p-2 border border-border/60 rounded">
                          <p className="font-mono text-[8px] uppercase text-muted-foreground">Age</p>
                          <p className="font-display text-base">{inputs.age ?? '—'} yrs</p>
                        </div>
                        <div className="bg-card p-2 border border-border/60 rounded">
                          <p className="font-mono text-[8px] uppercase text-muted-foreground">Blood Pressure</p>
                          <p className="font-display text-base">{inputs.ap_hi ?? '—'}/{inputs.ap_lo ?? '—'}</p>
                        </div>
                        <div className="bg-card p-2 border border-border/60 rounded">
                          <p className="font-mono text-[8px] uppercase text-muted-foreground">BMI</p>
                          <p className="font-display text-base">{item.bmi ?? '—'}</p>
                        </div>
                        <div className="bg-card p-2 border border-border/60 rounded">
                          <p className="font-mono text-[8px] uppercase text-muted-foreground">Chol / Gluc</p>
                          <p className="font-display text-base">{inputs.cholesterol ?? '1'} / {inputs.gluc ?? '1'}</p>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.statusMessage}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="lg:col-span-3 flex lg:flex-col items-center lg:items-end justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleLoadAssessment(item)}
                      className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-border px-4 py-2 font-mono text-xs uppercase hover:bg-card hover:text-foreground transition-colors"
                    >
                      Reload to Assess ↺
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="font-mono text-[10px] text-muted-foreground hover:text-destructive transition-colors py-1"
                    >
                      Delete record ×
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
