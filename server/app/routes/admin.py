from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
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
    current_user: User = Depends(require_role("superadmin"))
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
    current_user: User = Depends(require_role("superadmin"))
):
    return db.query(User).filter(User.role == "admin").all()

@router.get("/dashboard-stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "superadmin"]))
):
    enrolled_students = db.query(User).filter(User.role == "student").count()
    try:
        total_exams = db.execute(text("SELECT COUNT(*) FROM exams")).scalar() or 0
    except Exception as e:
        total_exams = 0
    return {
        "total_exams": total_exams,
        "violations": 0,
        "enrolled_students": enrolled_students
    }


@router.delete("/remove-admin/{admin_id}")
def remove_admin(
    admin_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("superadmin"))
):
    user_to_delete = db.query(User).filter(User.id == admin_id, User.role.in_(["admin", "superadmin"])).first()
    if not user_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
        
    if user_to_delete.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot delete yourself")
        
    if user_to_delete.role == "superadmin":
        super_count = db.query(User).filter(User.role == "superadmin").count()
        if super_count <= 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot remove the last superadmin")
            
    db.delete(user_to_delete)
    db.commit()
    return {"detail": "Admin successfully removed"}
