from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routes import auth, quizzes, ai_generate, stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Qwiz Me API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(quizzes.router, prefix="/api/v1")
app.include_router(ai_generate.router, prefix="/api/v1")
app.include_router(stats.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Welcome to Qwiz Me API", "docs": "/docs"}
