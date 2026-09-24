# CARDIA — Cardiovascular Intelligence

A cardiovascular risk assessment and model analytics system built with **FastAPI**, **React (Vite)**, and **scikit-learn**.

---

## Architecture Overview

```
cardio_project/
├── backend/
│   ├── main.py              # FastAPI endpoints, multi-model inference, CORS
│   └── schemas.py           # Pydantic v2 request/response schemas
├── model/
│   ├── cardio_model.pkl     # GradientBoostingClassifier (91.6% accuracy)
│   ├── logistic_model.pkl   # LogisticRegression (91.3% accuracy)
│   ├── adaboost_model.pkl   # AdaBoostClassifier (89.7% accuracy)
│   ├── scaler.pkl           # StandardScaler for all 11 clinical features
│   └── feature_names.pkl    # Ordered list of feature names
├── data/
│   └── cardio_data.csv      # Real training & evaluation dataset
├── cardio_model.ipynb       # Jupyter training & evaluation pipeline (100% runnable)
├── requirements.txt         # Production backend dependencies
└── frontend/                # React 19 + Vite + TailwindCSS 4 SPA
    ├── src/
    │   ├── api.js           # API configuration helper with VITE_API_BASE_URL support
    │   ├── components/      # AppShell, PageIntro, navigation
    │   └── pages/           # Dashboard, Assess, Models, Results, Insights, History, About
    ├── vercel.json          # SPA routing config for Vercel
    └── public/_redirects    # SPA routing config for Netlify / Cloudflare Pages
```

---

## Local Development

### 1. Backend (FastAPI)
```bash
# In project root: cardio_project/
python -m uvicorn backend.main:app --port 8000 --reload
```
- API Docs (Swagger): `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

### 2. Frontend (React + Vite)
```bash
# In frontend/ directory:
cd frontend
npm run dev
```
- Web Application: `http://localhost:3000`

---

## Pages & Features

| Route | Page | Description |
|---|---|---|
| `/` | **Dashboard** | Overview, real-time backend status, and quick access to latest assessment |
| `/prediction` | **Assess** | 4-stage clinical assessment with default adult values, interactive model picker (Gradient Boosting, Logistic Regression, AdaBoost), persistent outputs, and recommendations |
| `/model-analytics` | **Models** | Model performance comparison, interactive model activation, ROC-AUC, F1, RSS, and feature importance breakdown |
| `/results` | **Results** | Dataset breakdown (8,000 records, 80/20 train/test split), interactive BarChart & RadarChart toggles using Recharts |
| `/health-insights` | **Health Insights** | Expandable `+` / `−` wellness accordions and population statistical distributions |
| `/history` | **History** | Persistent assessment session logs with full patient parameters, reload into assessment action, and record deletion |
| `/about` | **About** | 5-stage ML pipeline architecture, anatomical heart diagram, and API reference |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/predict` | Predict CVD risk with selected model (`req.model`) |
| `GET` | `/api/model-analytics` | Evaluation metrics and feature importance across models |
| `GET` | `/api/insights` | Cleaned population sample data & demographics |
| `GET` | `/api/health-tips` | Structured clinical lifestyle recommendations |
| `GET` | `/api/health` | Service health status and loaded model inventory |

---

## Deployment Guide

### Option A: Vercel (Frontend) + Render (Backend) [Recommended]

#### 1. Deploy Backend on Render:
1. Create a new **Web Service** on [Render.com](https://render.com).
2. Connect your Git repository (root directory: `cardio_project`).
3. Set:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Note your Render URL (e.g. `https://cardio-backend.onrender.com`).

#### 2. Deploy Frontend on Vercel:
1. Import your Git repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://cardio-backend.onrender.com`
4. Deploy! `vercel.json` will automatically handle SPA client-side routing.

---

### Option B: Unified Single-Server Deployment (Render / Railway / VPS)
Run the build script in `frontend` and let FastAPI serve the static assets:
```bash
cd frontend && npm run build
```
FastAPI can serve `frontend/dist` with `StaticFiles(directory="frontend/dist", html=True)`.

---

## Verification & Testing
- Jupyter Notebook (`cardio_model.ipynb`): Tested and executes 100% end-to-end without errors, saving all models and preprocessing scalers.
- Frontend Production Build: Validated with `npm run build` (`0` exit code).
- Backend Multi-model Inference: Validated with Gradient Boosting, Logistic Regression, and AdaBoost.
