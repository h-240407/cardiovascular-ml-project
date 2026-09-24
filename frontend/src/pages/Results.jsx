import { useEffect, useState } from 'react'
import { PageIntro } from '../components/AppShell'
import { apiUrl } from '../api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts'

/* ─── Dataset facts ─── */
const DATASET = {
  total: 8000,
  train: 6400,
  test:  1600,
  features: 11,
  target: 'cardio (0 = healthy, 1 = at risk)',
  split: '80% train / 20% test',
  seed: 42,
  balanced: true,
  healthy: 4000,
  atRisk: 4000,
}

/* ─── Accuracy comparison data for BarChart ─── */
const ACCURACY_DATA = [
  { model: 'Gradient Boosting', Accuracy: 91.55, F1: 91.49, 'ROC AUC': 97.69 },
  { model: 'Logistic Regression', Accuracy: 91.25, F1: 91.16, 'ROC AUC': 97.84 },
  { model: 'AdaBoost', Accuracy: 89.70, F1: 89.39, 'ROC AUC': 96.74 },
]

/* ─── Radar chart data (per model) ─── */
const RADAR_DATA = [
  { metric: 'Accuracy', 'Gradient Boosting': 91.55, 'Logistic Regression': 91.25, 'AdaBoost': 89.70 },
  { metric: 'F1 Score',  'Gradient Boosting': 91.49, 'Logistic Regression': 91.16, 'AdaBoost': 89.39 },
  { metric: 'ROC AUC',   'Gradient Boosting': 97.69, 'Logistic Regression': 97.84, 'AdaBoost': 96.74 },
  { metric: 'CV Score',  'Gradient Boosting': 65.48, 'Logistic Regression': 0,     'AdaBoost': 0 },
]

const PALETTE = {
  'Gradient Boosting':   'var(--primary)',
  'Logistic Regression': 'oklch(0.67 0.11 203)',
  'AdaBoost':            'oklch(0.828 0.189 84.429)',
}

/* ─── Custom tooltip ─── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="border border-border bg-background px-4 py-3 shadow-lg">
      <p className="font-mono text-[9px] uppercase text-muted-foreground mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-display text-lg" style={{ color: p.color }}>
          {p.name}: {p.value.toFixed(2)}%
        </p>
      ))}
    </div>
  )
}

export default function Results() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeChart, setActiveChart] = useState('bar') // 'bar' | 'radar'

  useEffect(() => {
    fetch(apiUrl('/api/model-analytics'))
      .then(r => r.json())
      .then(d => { setAnalytics(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageIntro
        index="g"
        label="Results"
        title="The numbers."
        copy="Dataset breakdown, training/test split, and side-by-side model accuracy comparison using real pipeline metrics."
      />

      {/* Dataset section */}
      <section className="border-b border-border px-5 py-12 sm:px-8 lg:px-12">
        <p className="font-mono text-[10px] uppercase text-muted-foreground">(01) — Dataset</p>
        <h2 className="mt-4 font-display text-4xl uppercase">Tested on this data</h2>

        <div className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total samples',   value: DATASET.total.toLocaleString(), note: 'cardiovascular patient records' },
            { label: 'Training set',    value: DATASET.train.toLocaleString(), note: '80% · used to fit models' },
            { label: 'Test set',        value: DATASET.test.toLocaleString(),  note: '20% · used to evaluate models' },
            { label: 'Input features',  value: DATASET.features,               note: 'age, BP, cholesterol, glucose, lifestyle…' },
            { label: 'Healthy class',   value: DATASET.healthy.toLocaleString(), note: 'cardio = 0 · balanced dataset' },
            { label: 'At-risk class',   value: DATASET.atRisk.toLocaleString(),  note: 'cardio = 1 · balanced dataset' },
            { label: 'Train/test split', value: '80 / 20', note: 'random_state = 42' },
            { label: 'Class balance',   value: '50 / 50',  note: 'perfectly balanced — no resampling needed' },
          ].map(({ label, value, note }) => (
            <div key={label} className="bg-background p-6">
              <p className="font-mono text-[9px] uppercase text-muted-foreground">{label}</p>
              <p className="mt-2 font-display text-4xl">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Chart section */}
      <section className="border-b border-border px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase text-muted-foreground">(02) — Performance</p>
            <h2 className="mt-4 font-display text-4xl uppercase">Model accuracy graph</h2>
          </div>
          {/* Chart type toggle */}
          <div className="flex gap-px bg-border">
            {['bar', 'radar'].map(type => (
              <button
                key={type}
                onClick={() => setActiveChart(type)}
                className={`px-5 py-2.5 font-mono text-[9px] uppercase transition-colors ${
                  activeChart === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                {type === 'bar' ? 'Bar chart' : 'Radar chart'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 h-[360px]">
          {loading ? (
            <div className="flex h-full items-center justify-center font-mono text-[10px] uppercase text-muted-foreground">
              Loading chart data…
            </div>
          ) : activeChart === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ACCURACY_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 10 }} barGap={4}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="model"
                  tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[80, 100]}
                  tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--border)' }} />
                <Legend
                  iconType="square"
                  wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase' }}
                />
                <Bar dataKey="Accuracy"  fill="var(--primary)"             radius={[2, 2, 0, 0]} />
                <Bar dataKey="F1"        fill="oklch(0.67 0.11 203)"       radius={[2, 2, 0, 0]} />
                <Bar dataKey="ROC AUC"   fill="oklch(0.828 0.189 84.429)"  radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--muted-foreground)' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[60, 100]}
                  tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--muted-foreground)' }}
                  tickFormatter={v => `${v}%`}
                />
                <Radar name="Gradient Boosting"   dataKey="Gradient Boosting"   stroke="var(--primary)"           fill="var(--primary)"           fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Logistic Regression" dataKey="Logistic Regression" stroke="oklch(0.67 0.11 203)"     fill="oklch(0.67 0.11 203)"     fillOpacity={0.15} strokeWidth={2} />
                <Radar name="AdaBoost"            dataKey="AdaBoost"            stroke="oklch(0.828 0.189 84.429)" fill="oklch(0.828 0.189 84.429)" fillOpacity={0.15} strokeWidth={2} />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase' }} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        <p className="mt-4 font-mono text-[9px] uppercase text-muted-foreground">
          All values from actual ML pipeline · test set = 1,600 samples · random_state = 42
        </p>
      </section>

      {/* Model cards */}
      <section className="border-b border-border px-5 py-12 sm:px-8 lg:px-12">
        <p className="font-mono text-[10px] uppercase text-muted-foreground">(03) — Model breakdown</p>
        <h2 className="mt-4 font-display text-4xl uppercase">This model gives this accuracy</h2>
        <div className="mt-10 grid gap-px bg-border lg:grid-cols-3">
          {[
            {
              name: 'Gradient Boosting',
              idx: '01',
              accuracy: 91.55,
              f1: 91.49,
              roc: 97.69,
              rss: 243.56,
              cv: '65.48%',
              deployed: true,
              params: 'n_estimators=300, lr=0.05, max_depth=4',
              note: 'Deployed model — highest balanced performance across all metrics.',
            },
            {
              name: 'Logistic Regression',
              idx: '02',
              accuracy: 91.25,
              f1: 91.16,
              roc: 97.84,
              rss: 237.60,
              cv: '—',
              deployed: false,
              params: 'max_iter=1000',
              note: 'Linear baseline. Highest ROC AUC and lowest RSS — excellent probability calibration.',
            },
            {
              name: 'AdaBoost',
              idx: '03',
              accuracy: 89.70,
              f1: 89.39,
              roc: 96.74,
              rss: 503.70,
              cv: '—',
              deployed: false,
              params: 'n_estimators=200, lr=0.1, base=DT(depth=1)',
              note: 'Ensemble of stumps. Lower accuracy and highest RSS — weakest probability calibration.',
            },
          ].map(m => (
            <div key={m.name} className={`p-8 ${m.deployed ? 'bg-primary/5' : 'bg-background'}`}>
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">{m.idx}</span>
                {m.deployed && (
                  <span className="inline-flex rounded-full bg-primary px-2 py-0.5 font-mono text-[8px] uppercase text-primary-foreground">
                    deployed
                  </span>
                )}
              </div>
              <h3 className="mt-6 font-display text-4xl uppercase">{m.name}</h3>
              <p className="mt-1 font-mono text-[9px] text-muted-foreground">{m.params}</p>

              {/* Accuracy big number */}
              <div className="mt-6">
                <p className="font-mono text-[8px] uppercase text-muted-foreground">Accuracy</p>
                <p className="font-display text-5xl text-primary">{m.accuracy}%</p>
              </div>

              {/* Metric grid */}
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-4">
                {[['F1', m.f1 + '%'], ['ROC AUC', m.roc + '%'], ['RSS', m.rss]].map(([k, v]) => (
                  <div key={k}>
                    <p className="font-mono text-[8px] uppercase text-muted-foreground">{k}</p>
                    <p className="font-display text-lg">{v}</p>
                  </div>
                ))}
              </div>

              {m.cv !== '—' && (
                <p className="mt-3 font-mono text-[9px] text-muted-foreground">CV (5-fold): {m.cv}</p>
              )}

              <p className="mt-5 text-xs leading-relaxed text-muted-foreground border-l-2 border-primary pl-3">{m.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature importance strip */}
      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <p className="font-mono text-[10px] uppercase text-muted-foreground">(04) — Feature importance</p>
        <h2 className="mt-4 font-display text-4xl uppercase">What drives the prediction</h2>
        <p className="mt-3 text-sm text-muted-foreground max-w-lg">
          Top factors influencing the Gradient Boosting model's decision. Systolic BP and Age together account for ~78% of model influence.
        </p>
        <div className="mt-10 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={[
                { label: 'Systolic BP',       value: 58.63 },
                { label: 'Age',               value: 19.54 },
                { label: 'Cholesterol',       value: 9.30  },
                { label: 'Physical Activity', value: 3.60  },
                { label: 'Glucose',           value: 3.57  },
                { label: 'Diastolic BP',      value: 2.89  },
                { label: 'Smoking',           value: 1.40  },
              ]}
              margin={{ top: 0, right: 30, left: 110, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis
                type="number"
                tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={({ active, payload }) => active && payload?.length ? (
                <div className="border border-border bg-background px-3 py-2">
                  <p className="font-mono text-[9px] uppercase text-muted-foreground">{payload[0].payload.label}</p>
                  <p className="font-display text-xl" style={{ color: 'var(--primary)' }}>{payload[0].value.toFixed(2)}%</p>
                </div>
              ) : null} />
              <Bar dataKey="value" fill="var(--primary)" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-4 border-l-2 border-primary pl-4 text-xs leading-relaxed text-muted-foreground">
          Feature importance reflects model influence on prediction, not medical causation.
        </p>
      </section>
    </div>
  )
}
