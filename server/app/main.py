from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, Base
from app.routes import auth, admin
from app.models import user

Base.metadata.create_all(bind=engine)
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

@app.get("/health")
def health_check():
    return {"status": "healthy"}
    
