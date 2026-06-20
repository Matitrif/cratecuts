from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models.review import Review
from models.user import User
from schemas.review import ReviewCrear, ReviewActualizar, ReviewSalida, ReviewPublica
from dependencies import obtener_usuario_actual

router = APIRouter()

@router.post("/", response_model=ReviewSalida)
def crear_review(
    review: ReviewCrear,
    usuario_actual: User = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    nueva_review = Review(**review.model_dump(), id_usuario=usuario_actual.id)
    db.add(nueva_review)
    db.commit()
    db.refresh(nueva_review)
    return nueva_review

@router.get("/", response_model=List[ReviewPublica])
def listar_reviews(db: Session = Depends(get_db)):
    return db.query(Review).all()

@router.get("/mia", response_model=Optional[ReviewSalida])
def obtener_mi_review(
    id_album: int = Query(...),
    usuario_actual: User = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    return db.query(Review).filter(
        Review.id_album == id_album,
        Review.id_usuario == usuario_actual.id,
    ).first()

@router.get("/{id_review}", response_model=ReviewPublica)
def obtener_review(id_review: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == id_review).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review no encontrada")
    return review

@router.put("/{id_review}", response_model=ReviewSalida)
def actualizar_review(
    id_review: int,
    datos: ReviewActualizar,
    usuario_actual: User = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    review = db.query(Review).filter(Review.id == id_review).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review no encontrada")
    if review.id_usuario != usuario_actual.id:
        raise HTTPException(status_code=403, detail="No puedes editar la review de otro usuario")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(review, campo, valor)

    db.commit()
    db.refresh(review)
    return review

@router.delete("/{id_review}")
def eliminar_review(
    id_review: int,
    usuario_actual: User = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    review = db.query(Review).filter(Review.id == id_review).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review no encontrada")
    if review.id_usuario != usuario_actual.id:
        raise HTTPException(status_code=403, detail="No puedes eliminar la review de otro usuario")

    db.delete(review)
    db.commit()
    return {"mensaje": "Review eliminada correctamente"}
