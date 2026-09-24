import { useEffect, useState } from 'react'
import { PageIntro } from '../components/AppShell'
import { apiUrl } from '../api'

function getModelName(id) {
  if (id === 'logistic_regression') return 'Logistic Regression'
  if (id === 'adaboost') return 'AdaBoost'
  return 'Gradient Boosting'
}

function getModelId(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('logistic')) return 'logistic_regression'
  if (n.includes('ada')) return 'adaboost'
  return 'gradient_boosting'
}

export default function ModelAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedModelId, setSelectedModelId] = useState(() => {
    try {
      return sessionStorage.getItem('cardio_selected_model') ||
             localStorage.getItem('cardio_selected_model') ||
             'gradient_boosting'
    } catch {
      return 'gradient_boosting'
    }
  })

  useEffect(() => {
    fetch(apiUrl('/api/model-analytics'))
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function handleSelectModel(id) {
    setSelectedModelId(id)
    sessionStorage.setItem('cardio_selected_model', id)
    localStorage.setItem('cardio_selected_model', id)
  }

  if (loading) {
    return (
      <div>
        <PageIntro index="c" label="Model analytics" title="How the models perform." copy="Loading real model performance data from the backend…" />
        <div className="px-5 py-12 sm:px-8 lg:px-12">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-border animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div>
        <PageIntro index="c" label="Model analytics" title="How the models perform." copy="Could not load model analytics. Make sure the backend is running." />
        <div className="px-5 py-12 sm:px-8 lg:px-12">
          <p className="font-mono text-[10px] uppercase text-destructive">Backend offline — start the FastAPI server to see real metrics.</p>
        </div>
      </div>
    )
  }

  const models = data?.models ?? []
  const features = data?.feature_importance ?? []
  const maxAccuracy = models.length ? Math.max(...models.map(m => m.accuracy)) : 100

  return (
    <div>
      <PageIntro
        index="c"
        label="Model analytics"
        title="How the models perform."
        copy="Accuracy, F1, ROC AUC, and RSS from the actual ML pipeline. Click any model to set it as your active clinical classifier."
      />

      {/* Accuracy comparison bars */}
      <section className="border-b border-border px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-4xl uppercase">Accuracy comparison</h2>
            <p className="font-mono text-[11px] text-muted-foreground mt-1">
              Select a model below to use it across predictions
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 font-mono text-[10px] uppercase text-primary border border-primary/20">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Active in Assessment: <strong>{getModelName(selectedModelId)}</strong>
          </span>
        </div>

        <div className="mt-12 space-y-8">
          {models.map((model, i) => {
            const mId = getModelId(model.name)
            const isSelected = mId === selectedModelId
            return (
              <div
                key={model.name}
                onClick={() => handleSelectModel(mId)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSelectModel(mId) }}
                className={`grid items-center gap-3 p-4 rounded-lg cursor-pointer transition-all border lg:grid-cols-12 ${
                  isSelected ? 'bg-primary/10 border-primary ring-1 ring-primary/30' : 'bg-background border-transparent hover:border-border hover:bg-card'
                }`}
              >
                <span className="font-mono text-[10px] text-muted-foreground">0{i + 1}</span>
                <div className="lg:col-span-3">
                  <h3 className="font-display text-2xl uppercase">{model.name}</h3>
                  {isSelected ? (
                    <span className="font-mono text-[9px] uppercase text-primary font-bold">● Active selected</span>
                  ) : (
                    <span className="font-mono text-[8px] uppercase text-muted-foreground">Click to select</span>
                  )}
                </div>
                <div className="h-6 border border-border overflow-hidden lg:col-span-6 relative rounded-sm bg-muted/40">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${(model.accuracy / maxAccuracy) * 100}%`,
                      transition: 'width 1s ease-out',
                    }}
                  />
                </div>
                <span className="font-display text-3xl">{model.accuracy.toFixed(2)}%</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* F1/ROC AUC + Feature importance */}
      <section className="grid border-b border-border lg:grid-cols-2">
        {/* F1 / ROC AUC */}
        <div className="border-b border-border p-8 lg:border-b-0 lg:border-r lg:p-12">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">F1 / ROC AUC / RSS</p>
          <h2 className="mt-5 font-display text-5xl uppercase">Comparison.</h2>
          <div className="mt-8 space-y-6">
            {models.map(model => {
              const mId = getModelId(model.name)
              const isSelected = mId === selectedModelId
              return (
                <div
                  key={model.name}
                  onClick={() => handleSelectModel(mId)}
                  className={`border p-4 rounded-lg cursor-pointer transition-all ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-card/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[11px] font-semibold uppercase">{model.name}</p>
                    {isSelected && (
                      <span className="inline-flex rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[8px] uppercase text-primary font-bold">
                        active selected
                      </span>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4">
                    <div>
                      <p className="font-mono text-[9px] text-muted-foreground uppercase">F1</p>
                      <p className="font-display text-2xl">{model.f1_score.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] text-muted-foreground uppercase">ROC AUC</p>
                      <p className="font-display text-2xl">{model.roc_auc.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] text-muted-foreground uppercase">RSS</p>
                      <p className="font-display text-2xl">{model.rss.toFixed(1)}</p>
                    </div>
                  </div>
                  {model.cv_score && (
                    <p className="mt-2 font-mono text-[9px] text-muted-foreground">CV: {model.cv_score}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Feature importance */}
        <div className="p-8 lg:p-12">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">Predictive signal breakdown</p>
          <h2 className="mt-5 font-display text-5xl uppercase">Feature importance</h2>
          <div className="mt-8 space-y-4">
            {features.map((item, i) => (
              <div key={item.feature} className="flex items-center gap-4">
                <span className="w-5 font-mono text-[9px] text-muted-foreground">0{i + 1}</span>
                <span className="w-32 font-mono text-[10px] text-foreground shrink-0">{item.label}</span>
                <div className="relative h-px flex-1 bg-border">
                  <div
                    className="absolute left-0 top-0 h-px bg-primary"
                    style={{ width: `${item.importance}%` }}
                  />
                </div>
                <span className="font-mono text-xs w-12 text-right">{item.importance.toFixed(2)}%</span>
              </div>
            ))}
          </div>
          <p className="mt-8 border-l-2 border-primary pl-4 text-xs leading-relaxed text-muted-foreground">
            Feature weights represent empirical feature attribution in tree splits across the full clinical dataset.
          </p>
        </div>
      </section>

      {/* Performance table */}
      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl uppercase">Performance table</h2>
            <p className="font-mono text-[11px] text-muted-foreground mt-1">
              Click any model row to activate it for cardiovascular risk inference
            </p>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead className="font-mono text-[9px] uppercase text-muted-foreground">
              <tr>
                {['Model', 'Accuracy', 'F1 Score', 'ROC AUC', 'RSS', 'CV Score (5-fold)', 'Status'].map(h => (
                  <th key={h} className="border-b border-foreground py-4 pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {models.map(model => {
                const mId = getModelId(model.name)
                const isSelected = mId === selectedModelId
                return (
                  <tr
                    key={model.name}
                    onClick={() => handleSelectModel(mId)}
                    className={`cursor-pointer transition-colors border-b border-border ${
                      isSelected ? 'bg-primary/10 font-medium' : 'hover:bg-card/60'
                    }`}
                  >
                    <td className="py-5 text-sm font-medium pr-6">
                      <div className="flex items-center gap-2">
                        <span>{model.name}</span>
                      </div>
                    </td>
                    <td className="py-5 text-sm pr-6">{model.accuracy.toFixed(2)}%</td>
                    <td className="py-5 text-sm pr-6">{model.f1_score.toFixed(2)}%</td>
                    <td className="py-5 text-sm pr-6">{model.roc_auc.toFixed(2)}%</td>
                    <td className="py-5 text-sm pr-6">{model.rss.toFixed(2)}</td>
                    <td className="py-5 text-sm pr-6">{model.cv_score ?? '—'}</td>
                    <td className="py-5 text-sm pr-6">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 font-mono text-[9px] uppercase text-primary-foreground font-bold">
                          ● Active
                        </span>
                      ) : (
                        <span className="font-mono text-[9px] uppercase text-muted-foreground hover:text-foreground">
                          Click to select
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-6 font-mono text-[9px] uppercase text-muted-foreground">
          {data.note}
        </p>
      </section>
    </div>
  )
}
