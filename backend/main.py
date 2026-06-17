from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

from models import user, album, review
from routers import albums

app = FastAPI(
    title="CrateCuts API",
    description="API para gestionar tu backlog de música",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"mensaje": "CrateCuts API funcionando correctamente"}

app.include_router(albums.router, prefix="/albumes", tags=["álbumes"])