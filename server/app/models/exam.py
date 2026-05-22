from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from app.database.database import Base

class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, nullable=False)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    total_marks = Column(Integer, nullable=True, default=0)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(20), nullable=True, default="draft")
    webcam_required = Column(Boolean, nullable=True, default=True)
    microphone_required = Column(Boolean, nullable=True, default=False)
    max_warnings = Column(Integer, nullable=True, default=5)
    allow_copy_paste = Column(Boolean, nullable=True, default=False)
    ai_monitoring_enabled = Column(Boolean, nullable=True, default=True)
    questions = Column(JSONB, nullable=True, default=list)
