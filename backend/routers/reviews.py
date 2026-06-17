from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.review import Review
from schemas.review import ReviewCrear, ReviewActualizar, ReviewSalida

router = APIRouter()


@router.post("/", response_model=ReviewSalida)
def crear_review(review: ReviewCrear, db: Session = Depends(get_db)):
    nueva_review = Review(**review.model_dump())
    db.add(nueva_review)
    db.commit()
    db.refresh(nueva_review)
    return nueva_review


@router.get("/", response_model=List[ReviewSalida])
def listar_reviews(db: Session = Depends(get_db)):
    return db.query(Review).all()


@router.get("/{id_review}", response_model=ReviewSalida)
def obtener_review(id_review: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == id_review).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review no encontrada")
    return review


@router.put("/{id_review}", response_model=ReviewSalida)
def actualizar_review(id_review: int, datos: ReviewActualizar, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == id_review).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review no encontrada")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(review, campo, valor)

    db.commit()
    db.refresh(review)
    return review


@router.delete("/{id_review}")
def eliminar_review(id_review: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == id_review).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review no encontrada")

    db.delete(review)
    db.commit()
    return {"mensaje": "Review eliminada correctamente"}