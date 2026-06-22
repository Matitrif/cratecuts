from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import engine, Base, get_db

from models import user, album, review
from models.album import Album
from models.review import Review
from models.user import User
from routers import albums, reviews, users, auth, musicbrainz

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

@app.get("/estadisticas")
def obtener_estadisticas(db: Session = Depends(get_db)):
    total_albumes = db.query(Album).count()
    total_reviews = db.query(Review).filter(
        or_(Review.rating.isnot(None), Review.nota.isnot(None))
    ).count()
    total_usuarios = db.query(User).count()
    return {
        "total_albumes": total_albumes,
        "total_reviews": total_reviews,
        "total_usuarios": total_usuarios,
    }

app.include_router(albums.router, prefix="/albumes", tags=["álbumes"])
app.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
app.include_router(users.router, prefix="/usuarios", tags=["usuarios"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(musicbrainz.router, prefix="/musicbrainz", tags=["musicbrainz"])