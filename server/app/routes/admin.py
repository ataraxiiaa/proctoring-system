from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut
from app.auth.security import hash_password
from app.auth.dependencies import require_role

router = APIRouter(prefix="/admin", tags=["Admin Management"])

@router.post("/create-admin", response_model=UserOut)
def create_admin(
    admin_data: UserCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["superadmin"]))
):
    if db.query(User).filter(User.email == admin_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    new_admin = User(
        email=admin_data.email,
        full_name=admin_data.full_name,
        hashed_password=hash_password(admin_data.password),
        role="admin"
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin

@router.get("/list-admins", response_model=list[UserOut])
def list_admins(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["superadmin"]))
):
    return db.query(User).filter(User.role == "admin").all()

@router.delete("/remove-admin/{admin_id}")
def remove_admin(
    admin_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["superadmin"]))
):
    admin_to_delete = db.query(User).filter(User.id == admin_id, User.role == "admin").first()
    if not admin_to_delete:
        raise HTTPException(status_code=404, detail="Admin not found")
        
    db.delete(admin_to_delete)
    db.commit()
    return {"detail": "Admin successfully removed"}
