from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import AuditLog, Question, QuestionPaper, Subject
from app.schemas.dashboard import ChartPoint, DashboardResponse, KpiCard, RecentActivity

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(db: Session = Depends(get_db)) -> DashboardResponse:
    question_count = db.scalar(select(func.count(Question.id))) or 0
    subject_count = db.scalar(select(func.count(Subject.id))) or 0
    paper_count = db.scalar(select(func.count(QuestionPaper.id))) or 0
    hard_count = db.scalar(select(func.count(Question.id)).where(Question.difficulty == "Hard")) or 0

    bloom_rows = db.execute(
        select(Question.bloom_level, func.count()).group_by(Question.bloom_level)
    ).all()
    difficulty_rows = db.execute(
        select(Question.difficulty, func.count()).group_by(Question.difficulty)
    ).all()
    activity_rows = db.scalars(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(6)).all()

    return DashboardResponse(
        kpis=[
            KpiCard(label="Questions", value=question_count, trend="+18% this term"),
            KpiCard(label="Subjects", value=subject_count, trend="6 seeded programs"),
            KpiCard(label="Generated Papers", value=paper_count, trend="5 sample papers"),
            KpiCard(label="Advanced Items", value=hard_count, trend="higher-order readiness"),
        ],
        bloom_distribution=[ChartPoint(name=name, value=count) for name, count in bloom_rows],
        difficulty_breakdown=[ChartPoint(name=name, value=count) for name, count in difficulty_rows],
        recent_activity=[
            RecentActivity(
                actor=row.actor,
                action=row.action,
                detail=row.detail,
                created_at=row.created_at.isoformat(),
            )
            for row in activity_rows
        ],
    )
