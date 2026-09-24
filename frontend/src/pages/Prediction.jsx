import { useState, useRef, useEffect } from 'react'
import { PageIntro } from '../components/AppShell'
import { apiUrl } from '../api'

/* ─── Exact backend fields from schemas.py ─── */
const SECTIONS = [
  {
    number: '01',
    title: 'About you',
    fields: [
      { key: 'age',    label: 'Age',    unit: 'years',              type: 'number', min: 1,   max: 120, placeholder: '45' },
      { key: 'gender', label: 'Gender', unit: '1=Female · 2=Male', type: 'select', options: [{ v: 1, l: '1 — Female' }, { v: 2, l: '2 — Male' }] },
      { key: 'height', label: 'Height', unit: 'cm',                 type: 'number', min: 100, max: 230, placeholder: '170' },
      { key: 'weight', label: 'Weight', unit: 'kg',                 type: 'number', min: 30,  max: 250, placeholder: '70' },
    ],
  },
  {
    number: '02',
    title: 'Blood pressure',
    fields: [
      { key: 'ap_hi', label: 'Systolic BP',  unit: 'mmHg', type: 'number', min: 60,  max: 260, placeholder: '120' },
      { key: 'ap_lo', label: 'Diastolic BP', unit: 'mmHg', type: 'number', min: 40,  max: 200, placeholder: '80' },
    ],
  },
  {
    number: '03',
    title: 'Health indicators',
    fields: [
      { key: 'cholesterol', label: 'Cholesterol', unit: '1=Normal · 2=Above · 3=Well Above', type: 'select', options: [{ v: 1, l: '1 — Normal' }, { v: 2, l: '2 — Above Normal' }, { v: 3, l: '3 — Well Above Normal' }] },
      { key: 'gluc',        label: 'Glucose',     unit: '1=Normal · 2=Above · 3=Well Above', type: 'select', options: [{ v: 1, l: '1 — Normal' }, { v: 2, l: '2 — Above Normal' }, { v: 3, l: '3 — Well Above Normal' }] },
    ],
  },
  {
    number: '04',
    title: 'Lifestyle',
    fields: [
      { key: 'smoke',  label: 'Smoking',          unit: '0=No · 1=Yes', type: 'select', options: [{ v: 0, l: '0 — No' }, { v: 1, l: '1 — Yes' }] },
      { key: 'alco',   label: 'Alcohol use',       unit: '0=No · 1=Yes', type: 'select', options: [{ v: 0, l: '0 — No' }, { v: 1, l: '1 — Yes' }] },
      { key: 'active', label: 'Physical activity', unit: '0=No · 1=Yes', type: 'select', options: [{ v: 0, l: '0 — No' }, { v: 1, l: '1 — Yes' }] },
    ],
  },
]

/* ─── Default values (typical adult profile) ─── */
const DEFAULTS = {
  age: '45',
  gender: '2',
  height: '170',
  weight: '70',
  ap_hi: '120',
  ap_lo: '80',
  cholesterol: '1',
  gluc: '1',
  smoke: '0',
  alco: '0',
  active: '1',
}

const MODEL_OPTIONS = [
  { id: 'gradient_boosting', name: 'Gradient Boosting', idx: '01', accuracy: '91.6%', note: 'Default ensemble · Highest overall performance & sensitivity' },
  { id: 'logistic_regression', name: 'Logistic Regression', idx: '02', accuracy: '91.3%', note: 'High interpretability · Rapid linear probabilistic classification' },
  { id: 'adaboost', name: 'AdaBoost', idx: '03', accuracy: '89.7%', note: 'Adaptive boosting · Strong decision-boundary separation' },
]

export default function Prediction() {
  // Load persisted form or fallback to defaults
  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem('cardio_form')
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  // Load persisted model selection
  const [selectedModel, setSelectedModel] = useState(() => {
    try {
      return sessionStorage.getItem('cardio_selected_model') ||
             localStorage.getItem('cardio_selected_model') ||
             'gradient_boosting'
    } catch {
      return 'gradient_boosting'
    }
  })

  // Load persisted result so leaving and returning preserves results
  const [result, setResult] = useState(() => {
    try {
      const saved = sessionStorage.getItem('cardio_last_result')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const resultRef = useRef(null)

  // Sync model selection with storage
  function handleModelSelect(id) {
    setSelectedModel(id)
    sessionStorage.setItem('cardio_selected_model', id)
    localStorage.setItem('cardio_selected_model', id)
  }

  function handleChange(key, value) {
    setForm(prev => {
      const updated = { ...prev, [key]: value }
      sessionStorage.setItem('cardio_form', JSON.stringify(updated))
      return updated
    })
    setError(null)
  }

  function handleReset() {
    setForm(DEFAULTS)
    setSelectedModel('gradient_boosting')
    setResult(null)
    setError(null)
    sessionStorage.removeItem('cardio_last_result')
    sessionStorage.removeItem('cardio_form')
    sessionStorage.setItem('cardio_selected_model', 'gradient_boosting')
    localStorage.setItem('cardio_selected_model', 'gradient_boosting')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        age: parseInt(form.age),
        gender: parseInt(form.gender),
        height: parseFloat(form.height),
        weight: parseFloat(form.weight),
        ap_hi: parseInt(form.ap_hi),
        ap_lo: parseInt(form.ap_lo),
        cholesterol: parseInt(form.cholesterol),
        gluc: parseInt(form.gluc),
        smoke: parseInt(form.smoke),
        alco: parseInt(form.alco),
        active: parseInt(form.active),
        model: selectedModel,
      }
      const res = await fetch(apiUrl('/api/predict'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail.detail || `Server error ${res.status}`)
      }
      const data = await res.json()
      setResult(data)
      
      // Persist latest result for page persistence
      sessionStorage.setItem('cardio_last_result', JSON.stringify(data))
      sessionStorage.setItem('cardio_form', JSON.stringify(form))
      sessionStorage.setItem('cardio_selected_model', selectedModel)
      localStorage.setItem('cardio_selected_model', selectedModel)

      // Save to History log
      const historyItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        dateStr: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        modelUsed: data.model_used || MODEL_OPTIONS.find(m => m.id === selectedModel)?.name || 'Gradient Boosting',
        probabilityPct: data.probability_pct,
        riskLevel: data.risk_level,
        isHighRisk: data.is_high_risk,
        bmi: data.bmi,
        statusMessage: data.status_message,
        recommendations: data.recommendations || [],
        inputs: { ...form },
      }

      try {
        const existingRaw = localStorage.getItem('cardio_history')
        const historyList = existingRaw ? JSON.parse(existingRaw) : []
        localStorage.setItem('cardio_history', JSON.stringify([historyItem, ...historyList].slice(0, 50)))
      } catch (err) {
        console.warn('Could not save history to localStorage', err)
      }

      // Auto-scroll to result
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageIntro
        index="b"
        label="Prediction"
        title="Build the signal."
        copy="A staged assessment using clinical inputs. Results persist across page views until you click 'Reset to defaults'."
      />

      <form className="divide-y divide-border" onSubmit={handleSubmit}>
        {SECTIONS.map(({ number, title, fields }) => (
          <section key={number} className="grid gap-8 px-5 py-10 sm:px-8 lg:grid-cols-12 lg:px-12 lg:py-14">
            <div className="lg:col-span-4">
              <span className="font-display text-7xl text-primary">{number}</span>
              <h2 className="mt-3 font-display text-4xl uppercase">{title}</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-8">
              {fields.map(field => (
                <div key={field.key} className="border-b border-foreground pb-4 min-w-0">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1" htmlFor={field.key}>
                    {field.label}
                  </label>
                  <div className="mt-1">
                    {field.type === 'select' ? (
                      <div className="relative">
                        <select
                          id={field.key}
                          value={form[field.key]}
                          onChange={e => handleChange(field.key, e.target.value)}
                          className="h-12 w-full border-0 bg-transparent px-0 text-lg sm:text-xl font-medium shadow-none focus:outline-none text-foreground cursor-pointer appearance-none pr-8 leading-normal"
                          style={{
                            fontFamily: 'var(--font-sans)',
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23888' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.25rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.25em 1.25em',
                          }}
                          required
                        >
                          {field.options.map(o => (
                            <option key={o.v} value={o.v} className="bg-card text-foreground py-2 font-sans">
                              {o.l}
                            </option>
                          ))}
                        </select>
                        <div className="mt-1.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground whitespace-normal leading-tight">
                          {field.unit}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-end gap-3">
                        <input
                          id={field.key}
                          type="number"
                          value={form[field.key]}
                          onChange={e => handleChange(field.key, e.target.value)}
                          min={field.min}
                          max={field.max}
                          placeholder={field.placeholder}
                          aria-label={field.label}
                          className="h-12 border-0 bg-transparent px-0 text-2xl shadow-none focus:outline-none flex-1 min-w-0"
                          style={{ fontFamily: 'var(--font-display)' }}
                          required
                        />
                        <span className="pb-3 font-mono text-[9px] uppercase text-muted-foreground whitespace-nowrap">
                          {field.unit}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Model selection + submit */}
        <section className="bg-card px-5 py-12 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase text-muted-foreground">Model selection</p>
              <h2 className="mt-2 font-display text-4xl uppercase">Choose the method</h2>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                Click any model below to select it for your prediction assessment.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 font-mono text-[10px] uppercase text-primary font-semibold border border-primary/20">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Active: {MODEL_OPTIONS.find(m => m.id === selectedModel)?.name}
            </span>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {MODEL_OPTIONS.map(({ id, name, idx, accuracy, note }) => {
              const isSelected = selectedModel === id
              return (
                <div
                  key={id}
                  onClick={() => handleModelSelect(id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleModelSelect(id) }}
                  className={`p-6 transition-all cursor-pointer rounded-lg border text-left relative ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary/40'
                      : 'bg-background/80 border-border hover:border-primary/40 hover:bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground">{idx}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider ${
                      isSelected ? 'bg-primary text-primary-foreground font-semibold' : 'bg-muted text-muted-foreground'
                    }`}>
                      {isSelected ? '✓ Selected' : 'Click to select'}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl uppercase tracking-wide">{name}</h3>
                  <p className="mt-1 font-mono text-[11px] text-primary font-semibold">{accuracy} test accuracy</p>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{note}</p>
                </div>
              )
            })}
          </div>

          {error && (
            <div className="mt-6 border border-destructive/30 bg-destructive/5 px-4 py-3 font-mono text-xs text-destructive">
              Error: {error}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Running prediction…' : `Run prediction with ${MODEL_OPTIONS.find(m => m.id === selectedModel)?.name} →`}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Reset to defaults
            </button>
          </div>
        </section>
      </form>

      {/* Result panel */}
      <div ref={resultRef}>
        {result && <ResultPanel result={result} />}
      </div>
    </div>
  )
}

function RiskBadge({ isHigh, probability }) {
  return (
    <div className={`inline-flex items-center gap-3 rounded-none border-l-4 px-6 py-4 ${
      isHigh ? 'border-destructive bg-destructive/5' : 'border-primary bg-primary/5'
    }`}>
      <span className="text-3xl">{isHigh ? '⚠️' : '✅'}</span>
      <div>
        <p className={`font-mono text-[10px] uppercase font-semibold ${isHigh ? 'text-destructive' : 'text-primary'}`}>
          {isHigh ? 'HIGH CARDIOVASCULAR RISK' : 'LOW CARDIOVASCULAR RISK'}
        </p>
        <p className="font-display text-4xl">{probability}% probability</p>
      </div>
    </div>
  )
}

function ResultPanel({ result }) {
  const isHigh = result.is_high_risk

  return (
    <section className="border-t-4 border-primary px-5 py-12 sm:px-8 lg:px-12 bg-background">
      {/* Big risk banner */}
      <div className={`-mx-5 -mt-12 mb-10 px-5 py-8 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 ${
        isHigh ? 'bg-destructive/10' : 'bg-primary/5'
      }`}>
        <p className="font-mono text-[10px] uppercase text-muted-foreground mb-4">(c) — Assessment result (Persists until Reset)</p>
        <RiskBadge isHigh={isHigh} probability={result.probability_pct} />
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{result.status_message}</p>
      </div>

      {/* Detail grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Probability bar */}
        <div className="lg:col-span-6">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">Confidence & Risk Probability</p>
          <div className="mt-4">
            <div className="flex items-end justify-between mb-2">
              <span className="font-display text-7xl leading-none">{result.probability_pct}%</span>
              <span className="font-mono text-[9px] uppercase text-muted-foreground pb-2">probability of CVD</span>
            </div>
            <div className="h-3 w-full bg-border overflow-hidden rounded-full">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${result.probability_pct}%`,
                  backgroundColor: isHigh ? 'var(--destructive)' : 'var(--primary)',
                  transition: 'width 1.2s ease-out',
                }}
              />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[8px] text-muted-foreground">
              <span>0% (Optimal)</span><span>50% (Threshold)</span><span>100% (High Risk)</span>
            </div>
          </div>
        </div>

        {/* Key metrics */}
        <div className="lg:col-span-6 space-y-4">
          {[
            ['Risk level',     result.risk_level],
            ['BMI',            `${result.bmi} kg/m²`],
            ['Model used',     result.model_used || 'Gradient Boosting'],
            ['Result code',    result.prediction === 1 ? '1 — CVD risk present' : '0 — No CVD risk detected'],
          ].map(([label, value]) => (
            <div key={label} className="border-b border-border pb-3 flex justify-between items-end">
              <p className="font-mono text-[9px] uppercase text-muted-foreground">{label}</p>
              <p className="font-display text-xl uppercase">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {result.recommendations?.length > 0 && (
        <div className="mt-10">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">Personalised recommendations</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {result.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-4 border border-border p-4 bg-card/40">
                <span className="font-mono text-[10px] text-primary shrink-0 mt-0.5">0{i + 1}</span>
                <p className="text-sm leading-relaxed text-muted-foreground">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-10 bg-foreground px-5 py-6 text-background sm:px-8">
        <p className="font-mono text-[10px] uppercase text-primary">Clinical notice</p>
        <p className="mt-3 text-sm leading-relaxed text-background/70">
          This tool is for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions.
        </p>
      </div>
    </section>
  )
}
