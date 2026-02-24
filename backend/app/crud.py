"""Generic CRUD factory for CROC modules."""
from typing import Type, List, Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import SQLModel, Session, select
from .db import get_session


def make_crud_router(
    model: Type[SQLModel],
    prefix: str,
    tag: str,
    project_field: str = "project_id",
) -> APIRouter:
    """Generate a standard CRUD router for a SQLModel table."""
    router = APIRouter(prefix=prefix, tags=[tag])

    @router.get("")
    def list_items(project_id: int, session: Session = Depends(get_session)) -> List[Dict[str, Any]]:
        stmt = select(model).where(getattr(model, project_field) == project_id)
        items = session.exec(stmt).all()
        return [item.model_dump() for item in items]

    @router.get("/{item_id}")
    def get_item(item_id: int, session: Session = Depends(get_session)) -> Dict[str, Any]:
        item = session.get(model, item_id)
        if not item:
            raise HTTPException(404, f"{model.__name__} not found")
        return item.model_dump()

    @router.post("")
    def create_item(payload: Dict[str, Any], session: Session = Depends(get_session)) -> Dict[str, Any]:
        item = model(**payload)
        session.add(item)
        session.commit()
        session.refresh(item)
        return item.model_dump()

    @router.put("/{item_id}")
    def update_item(item_id: int, payload: Dict[str, Any], session: Session = Depends(get_session)) -> Dict[str, Any]:
        item = session.get(model, item_id)
        if not item:
            raise HTTPException(404, f"{model.__name__} not found")
        for k, v in payload.items():
            if k != "id" and hasattr(item, k):
                setattr(item, k, v)
        session.add(item)
        session.commit()
        session.refresh(item)
        return item.model_dump()

    @router.delete("/{item_id}")
    def delete_item(item_id: int, session: Session = Depends(get_session)) -> Dict[str, str]:
        item = session.get(model, item_id)
        if not item:
            raise HTTPException(404, f"{model.__name__} not found")
        session.delete(item)
        session.commit()
        return {"deleted": True, "id": str(item_id)}

    return router
