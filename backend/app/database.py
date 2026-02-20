from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import NullPool

from app.config import settings

connect_args = {}
db_url = settings.DATABASE_URL

if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)

pool_kwargs = {}
if db_url.startswith("sqlite"):
    pass
else:
    pool_kwargs["poolclass"] = NullPool

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    **pool_kwargs,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from app.models import __all_models__  # noqa: F401

    Base.metadata.create_all(bind=engine)
