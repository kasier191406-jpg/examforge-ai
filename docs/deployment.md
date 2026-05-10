# ExamForge AI Deployment

## Frontend: Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://<render-backend-url>/api/v1`

## Backend: Render

- Use `render.yaml` from the repository root.
- Set `DATABASE_URL` to the Supabase PostgreSQL connection string.
- Set `BACKEND_CORS_ORIGINS` to the Vercel frontend URL.
- Render health check: `/api/v1/health`

## Database: Supabase PostgreSQL

Use a SQLAlchemy-compatible URL:

```text
postgresql+psycopg://USER:PASSWORD@HOST:5432/postgres
```

## Local Docker

```bash
docker compose up --build
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:8000`
