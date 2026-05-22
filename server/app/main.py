from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, Base, SessionLocal
from app.routes import auth, admin, exams
from app.models.user import User
from app.models.exam import Exam
from app.auth.security import hash_password

# Create tables
Base.metadata.create_all(bind=engine)

# Seed superadmin
def seed_superadmin():
    db = SessionLocal()
    try:
        superadmin = db.query(User).filter(User.email == "superadmin@test.com").first()
        if not superadmin:
            db_superadmin = User(
                email="superadmin@test.com",
                full_name="System Superadmin",
                hashed_password=hash_password("admin123"),
                role="superadmin"
            )
            db.add(db_superadmin)
            db.commit()
            print("Default superadmin account seeded successfully.")
    except Exception as e:
        print(f"Error seeding default superadmin: {e}")
    finally:
        db.close()

seed_superadmin()

app = FastAPI(
    title="Proctoring System",
    description="Proctoring System API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(exams.router)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
