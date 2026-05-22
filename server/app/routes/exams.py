from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.models.exam import Exam
from app.auth.dependencies import require_role
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/exams", tags=["Exams"])

class ExamCreate(BaseModel):
    title: str
    description: Optional[str] = None
    duration: int
    pass_percentage: Optional[int] = 50
    questions: List[Dict[str, Any]] = []

@router.post("")
def create_exam(
    exam_data: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "superadmin"]))
):
    total_marks = sum(q.get("points", 0) for q in exam_data.questions)
    
    new_exam = Exam(
        title=exam_data.title,
        description=exam_data.description,
        duration_minutes=exam_data.duration,
        total_marks=total_marks,
        created_by=current_user.id,
        status="active",
        questions=exam_data.questions
    )
    db.add(new_exam)
    db.commit()
    db.refresh(new_exam)
    return new_exam

@router.get("")
def list_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student", "admin", "superadmin"]))
):
    return db.query(Exam).all()

@router.get("/{exam_id}")
def get_exam(
    exam_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student", "admin", "superadmin"]))
):
    try:
        exam_int_id = int(exam_id)
        exam = db.query(Exam).filter(Exam.id == exam_int_id).first()
    except ValueError:
        exam = None

    if not exam:
        # Fallback to mock exams if they query a mock ID like "ex_123" or "ex_124"
        if exam_id == "ex_123" or exam_id == "ex_124":
            return {
                "id": exam_id,
                "title": "CS301: Introduction to Artificial Intelligence - Midterm" if exam_id == "ex_123" else "CS305: Data Structures - Final",
                "description": "Midterm Examination for Introduction to AI.",
                "duration_minutes": 60 if exam_id == "ex_123" else 120,
                "total_marks": 25,
                "status": "active",
                "webcam_required": True,
                "max_warnings": 3,
                "questions": [
                    {
                        "id": "q1",
                        "text": "Which search algorithm guarantees finding the shortest path first in an unweighted graph?",
                        "type": "multiple_choice",
                        "points": 5,
                        "options": [
                            "Depth-First Search (DFS)",
                            "Breadth-First Search (BFS)",
                            "Depth-Limited Search",
                            "Greedy Best-First Search"
                        ]
                    },
                    {
                        "id": "q2",
                        "text": "What is the primary purpose of an activation function in an artificial neural network?",
                        "type": "multiple_choice",
                        "points": 5,
                        "options": [
                            "To normalize the input data",
                            "To introduce non-linearity into the network",
                            "To speed up the training time",
                            "To store the weights of the network"
                        ]
                    },
                    {
                        "id": "q3",
                        "text": "In a minimax game tree, what does the alpha parameter represent?",
                        "type": "multiple_choice",
                        "points": 5,
                        "options": [
                            "The minimum score the maximizing player is assured of",
                            "The maximum score the minimizing player is assured of",
                            "The learning rate of the agent",
                            "The discount factor for future rewards"
                        ]
                    },
                    {
                        "id": "q4",
                        "text": "Briefly explain the difference between supervised and unsupervised learning, providing one example of each.",
                        "type": "text",
                        "points": 10,
                        "options": []
                    }
                ]
            }
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam
