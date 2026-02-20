# Qwiz Me

AI-powered quiz web application.

## Project Structure

- `backend/` - FastAPI + SQLAlchemy + SQLite
- `frontend/` - React + Vite + TypeScript + TailwindCSS

## Development

### Backend
```bash
cd backend
source venv/bin/activate
python run.py
# Runs on http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

## API
All endpoints under `/api/v1`. Auth via Bearer JWT token.

## Tech Stack
- **Backend:** FastAPI, SQLAlchemy, SQLite, python-jose (JWT), passlib (bcrypt)
- **Frontend:** React, TypeScript, Vite, TailwindCSS, Axios, React Router, lucide-react
- **AI:** Mock AI service (swappable for OpenAI later)
