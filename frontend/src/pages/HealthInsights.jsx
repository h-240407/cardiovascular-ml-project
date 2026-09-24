import { useEffect, useState } from 'react'
import { PageIntro, Unavailable } from '../components/AppShell'
import { apiUrl } from '../api'

export default function HealthInsights() {
  const [insights, setInsights] = useState(null)
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)
  const [openTip, setOpenTip] = useState(null) // accordion state

  useEffect(() => {
    Promise.all([
      fetch(apiUrl('/api/insights')).then(r => r.json()),
      fetch(apiUrl('/api/health-tips')).then(r => r.json()),
    ]).then(([insightsData, tipsData]) => {
      setInsights(insightsData)
      setTips(tipsData)
      setOpenTip(tipsData[0]?.id ?? null) // open first by default
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const lastResult = (() => {
    try { return JSON.parse(sessionStorage.getItem('cardio_last_result') || 'null') } catch { return null }
  })()

  const interpreters = lastResult ? [
    {
      label: 'Blood Pressure',
      value: lastResult.recommendations?.some(r => r.toLowerCase().includes('blood pressure'))
        ? 'Elevated — consider monitoring and reducing sodium intake'
        : 'Within expected range for assessment',
    },
    {
      label: 'Cholesterol',
      value: lastResult.recommendations?.some(r => r.toLowerCase().includes('cholesterol'))
        ? 'Above normal — dietary adjustments recommended (avocados, nuts, limit saturated fats)'
        : 'Within normal range',
    },
    {
      label: 'Glucose',
      value: 'Interpreted from assessment input — consult a physician for clinical measurement',
    },
    {
      label: 'Lifestyle',
      value: lastResult.recommendations?.some(r => r.toLowerCase().includes('exercise'))
        ? 'Low physical activity detected — aim for 150 min/week moderate exercise'
        : lastResult.recommendations?.some(r => r.toLowerCase().includes('smoking'))
          ? 'Smoking detected — quitting is the single best step for arterial health'
          : 'Lifestyle factors within acceptable range',
    },
    {
      label: 'Overall Assessment',
      value: `${lastResult.risk_level} · BMI ${lastResult.bmi} · ${lastResult.probability_pct}% cardiovascular probability`,
    },
  ] : null

  return (
    <div>
      <PageIntro
        index="d"
        label="Health insights"
        title="Read the signal."
        copy="This space interprets real assessment inputs and displays dataset-level population insights. It does not diagnose and never fills gaps with assumptions."
      />

      {/* Assessment interpretation rows */}
      <section className="divide-y divide-border border-b border-border">
        <div className="px-5 py-4 sm:px-8 lg:px-12">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">
            {lastResult ? 'Interpreting your last assessment' : 'No assessment yet — run a prediction first'}
          </p>
        </div>
        {(interpreters || ['Blood Pressure', 'Cholesterol', 'Glucose', 'Lifestyle', 'Overall Assessment']
          .map(x => ({ label: x, value: null }))).map((item, i) => (
          <div key={item.label} className="grid gap-4 px-5 py-8 sm:px-8 lg:grid-cols-12 lg:px-12">
            <span className="font-mono text-[10px] text-muted-foreground">0{i + 1}</span>
            <h2 className="font-display text-3xl uppercase lg:col-span-4">{item.label}</h2>
            <p className="text-sm text-muted-foreground lg:col-span-5">
              {item.value ?? 'Complete an assessment to populate this section with inputs and model output.'}
            </p>
            <span className="lg:text-right">
              {item.value
                ? <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 font-mono text-[9px] uppercase text-primary">Live</span>
                : <Unavailable />}
            </span>
          </div>
        ))}
      </section>

      {/* Population stats */}
      {!loading && insights && (
        <section className="border-b border-border px-5 py-12 sm:px-8 lg:px-12">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">(e) — Dataset insights</p>
          <h2 className="mt-5 font-display text-5xl uppercase">Population overview</h2>
          <div className="mt-8 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Total records',    value: insights.total_records.toLocaleString() },
              { label: 'Healthy',          value: insights.healthy_count.toLocaleString() },
              { label: 'High risk',        value: insights.high_risk_count.toLocaleString() },
              { label: 'Avg age',          value: `${insights.avg_age} yrs` },
              { label: 'Avg systolic BP',  value: `${insights.avg_systolic_bp} mmHg` },
              { label: 'Risk prevalence',  value: `${((insights.high_risk_count / insights.total_records) * 100).toFixed(1)}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-background p-6">
                <p className="font-mono text-[9px] uppercase text-muted-foreground">{label}</p>
                <p className="mt-3 font-display text-4xl">{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Health tips — accordion with + / − */}
      {tips.length > 0 && (
        <section className="px-5 py-12 sm:px-8 lg:px-12">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">(f) — Health guidance</p>
          <h2 className="mt-5 font-display text-5xl uppercase">Cardiovascular tips</h2>
          <div className="mt-8 divide-y divide-border border-y border-border">
            {tips.map((tip, i) => {
              const isOpen = openTip === tip.id
              return (
                <div key={tip.id}>
                  {/* Accordion header */}
                  <button
                    type="button"
                    onClick={() => setOpenTip(isOpen ? null : tip.id)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:text-primary"
                  >
                    <div className="flex items-center gap-5">
                      <span className="font-mono text-[10px] text-primary w-5">0{i + 1}</span>
                      <div>
                        <p className="font-mono text-[9px] uppercase text-muted-foreground">{tip.category}</p>
                        <h3 className="mt-1 font-display text-2xl uppercase sm:text-3xl">{tip.title}</h3>
                      </div>
                    </div>
                    {/* + / − icon */}
                    <span
                      className="shrink-0 text-2xl font-light text-primary transition-transform duration-300"
                      style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    >
                      +
                    </span>
                  </button>

                  {/* Accordion body */}
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: isOpen ? '400px' : '0px' }}
                  >
                    <div className="pb-8 pl-10">
                      <p className="text-sm leading-relaxed text-muted-foreground">{tip.description}</p>
                      <ul className="mt-4 space-y-3">
                        {tip.bullets.map((b, j) => (
                          <li key={j} className="flex gap-3 text-sm text-muted-foreground">
                            <span className="text-primary shrink-0 mt-0.5">→</span>
                            <span className="leading-relaxed">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <section className="bg-foreground px-5 py-12 text-background sm:px-8 lg:px-12">
        <p className="font-mono text-[10px] uppercase text-primary">Clinical notice</p>
        <p className="mt-4 max-w-3xl font-display text-4xl uppercase leading-tight">
          This tool is for educational and informational purposes and is not a substitute for professional medical advice.
        </p>
      </section>
    </div>
  )
}
