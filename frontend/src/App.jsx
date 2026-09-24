import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import Prediction from './pages/Prediction'
import ModelAnalytics from './pages/ModelAnalytics'
import HealthInsights from './pages/HealthInsights'
import History from './pages/History'
import About from './pages/About'
import Results from './pages/Results'

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/"                element={<Dashboard />}     />
          <Route path="/prediction"      element={<Prediction />}    />
          <Route path="/model-analytics" element={<ModelAnalytics />}/>
          <Route path="/results"         element={<Results />}       />
          <Route path="/health-insights" element={<HealthInsights />}/>
          <Route path="/history"         element={<History />}       />
          <Route path="/about"           element={<About />}         />
          <Route path="*"                element={<NotFound />}      />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <a href="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90">
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}
