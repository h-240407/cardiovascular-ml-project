import heart from '../assets/anatomical-heart.png'
import { PageIntro } from '../components/AppShell'
import { Link } from 'react-router-dom'

const pipeline = ['Health data', 'Preprocessing', 'Machine learning', 'Prediction', 'Analytics']

export default function About() {
  return (
    <div>
      <PageIntro
        index="f"
        label="About"
        title="From body to model."
        copy="CARDIA is a frontend for a cardiovascular prediction pipeline using Logistic Regression, Gradient Boosting, and AdaBoost."
      />

      <section className="relative overflow-hidden border-b border-border px-5 py-12 sm:px-8 lg:px-12">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {pipeline.map((x, i) => (
              <div key={x} className="flex items-center gap-5 border-t border-border py-5">
                <span className="font-mono text-[10px] text-primary">0{i + 1}</span>
                <h2 className="font-display text-4xl uppercase sm:text-5xl">{x}</h2>
                {i < pipeline.length - 1 && (
                  <span className="ml-auto font-mono text-muted-foreground">↓</span>
                )}
              </div>
            ))}
          </div>
          <div className="relative min-h-[520px] lg:col-span-5">
            <img
              src={heart}
              alt="Anatomical heart representing the CARDIA prediction pipeline"
              loading="lazy"
              width={1024}
              height={1280}
              className="heart-drift absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2"
            />
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-3">
        {[
          ['01', 'What it does', 'Transforms validated cardiovascular inputs into a model-generated prediction using Gradient Boosting (91.6% accuracy).'],
          ['02', 'How it works', 'Preprocesses the exact backend features (age, gender, height, weight, BP, cholesterol, glucose, lifestyle), runs the model, and returns its response.'],
          ['03', 'What it is not', 'It is not a diagnosis, treatment recommendation, or replacement for professional medical advice.'],
        ].map(([n, t, c]) => (
          <article key={n} className="border-b border-border p-8 lg:border-b-0 lg:border-r lg:p-10">
            <span className="font-mono text-[10px] text-primary">{n}</span>
            <h2 className="mt-6 font-display text-3xl uppercase">{t}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{c}</p>
          </article>
        ))}
      </section>

      <section className="border-t border-border px-5 py-12 sm:px-8 lg:px-12">
        <p className="font-mono text-[10px] uppercase text-muted-foreground">Backend endpoints</p>
        <div className="mt-6 space-y-2">
          {[
            ['POST', '/api/predict', 'Cardiovascular risk prediction'],
            ['GET',  '/api/insights', 'Dataset-level population insights'],
            ['GET',  '/api/health-tips', 'Curated health guidance'],
            ['GET',  '/api/health', 'Service health check'],
          ].map(([method, path, desc]) => (
            <div key={path} className="flex items-center gap-4 border-b border-border py-3">
              <span className="font-mono text-[10px] text-primary w-10 shrink-0">{method}</span>
              <span className="font-mono text-[11px]">{path}</span>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link
            to="/prediction"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Begin assessment →
          </Link>
        </div>
      </section>
    </div>
  )
}
