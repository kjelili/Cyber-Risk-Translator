from pathlib import Path
from sqlmodel import SQLModel, create_engine, Session

# Store DB next to the app so it works regardless of CWD when starting uvicorn
_db_dir = Path(__file__).resolve().parent
_db_path = _db_dir / "risktranslator.db"
DATABASE_URL = f"sqlite:///{_db_path.as_posix()}"
engine = create_engine(DATABASE_URL, echo=False)

def init_db() -> None:
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
