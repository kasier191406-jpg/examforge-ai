# ExamForge AI

Intelligent Question Paper Generation Platform for schools, colleges, and universities.

## Current State

This codebase has been upgraded in place from the initial scaffold into an ExamForge AI vertical slice:

- Premium React SaaS workspace with collapsible sidebar, topbar search, dark/light theme, charts, tables, import, generation, preview, history, analytics, and settings routes.
- Functional demo authentication with backend JWT login and frontend fallback demo mode.
- SQLAlchemy domain models for users, subjects, modules, questions, templates, papers, audit logs, and settings.
- Automatic demo seed data: admin user, 6 subjects, 15 modules, 200 questions, 5 sample generated papers.
- FastAPI application factory with CORS, structured logging, settings, health endpoint, dashboard APIs, catalog APIs, and SQLAlchemy session setup.
- Alembic bootstrap configuration.
- Dockerfiles, docker-compose, Vercel config, Render config, GitHub Actions workflow, and deployment notes.
- Sample import template at `samples/questions_import_template.csv`.

## Project Structure

```text
backend/
  app/
    api/
    core/
    models/
    schemas/
    repositories/
    services/
    ai/
    exporters/
    utils/
    main.py
  alembic/
  tests/
  requirements.txt
frontend/
  src/
    components/
    layouts/
    pages/
    services/
    store/
    types/
  package.json
docs/
samples/
```

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Health check:

```bash
curl http://localhost:8000/api/v1/health
```

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Demo Credentials

- Username: `admin`
- Password: `Admin@123`

Default institution: `Tech University`

## API Highlights

- `POST /api/v1/auth/login`
- `GET /api/v1/dashboard`
- `GET /api/v1/subjects`
- `GET /api/v1/modules`
- `GET /api/v1/questions`
- `GET /api/v1/templates`
- `GET /api/v1/papers`
- `GET /api/v1/analytics`

## Deployment

See [docs/deployment.md](docs/deployment.md).

## Next Engineering Increments

1. Replace frontend mock tables with TanStack Query integration for all backend endpoints.
2. Add protected JWT dependency and role-based permission checks across write APIs.
3. Implement full CRUD, Excel import persistence, similarity engine, generator engine, and PDF/DOCX exporters.
4. Add Alembic revision for the current schema and broaden pytest/React Testing Library coverage.
