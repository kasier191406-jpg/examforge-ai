from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(160))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(30), default="faculty")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Subject(Base, TimestampMixin):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    modules: Mapped[list["Module"]] = relationship(back_populates="subject", cascade="all, delete-orphan")


class Module(Base, TimestampMixin):
    __tablename__ = "modules"

    id: Mapped[int] = mapped_column(primary_key=True)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"), index=True)
    title: Mapped[str] = mapped_column(String(180), index=True)
    order_index: Mapped[int] = mapped_column(Integer, default=1)
    subject: Mapped[Subject] = relationship(back_populates="modules")
    questions: Mapped[list["Question"]] = relationship(back_populates="module")


class Question(Base, TimestampMixin):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(primary_key=True)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"), index=True)
    module_id: Mapped[int] = mapped_column(ForeignKey("modules.id"), index=True)
    text: Mapped[str] = mapped_column(Text)
    marks: Mapped[int] = mapped_column(Integer)
    difficulty: Mapped[str] = mapped_column(String(20), index=True)
    bloom_level: Mapped[str] = mapped_column(String(30), index=True)
    question_type: Mapped[str] = mapped_column(String(40), default="descriptive")
    keywords: Mapped[str] = mapped_column(String(255), default="")
    model_answer: Mapped[str] = mapped_column(Text, default="")
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    module: Mapped[Module] = relationship(back_populates="questions")


class ExamTemplate(Base, TimestampMixin):
    __tablename__ = "exam_templates"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    duration_minutes: Mapped[int] = mapped_column(Integer)
    total_marks: Mapped[int] = mapped_column(Integer)
    sections: Mapped[int] = mapped_column(Integer, default=3)
    instructions: Mapped[str] = mapped_column(Text, default="")


class QuestionPaper(Base, TimestampMixin):
    __tablename__ = "question_papers"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(180))
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"), index=True)
    total_marks: Mapped[int] = mapped_column(Integer)
    duration_minutes: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(30), default="draft")
    generated_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    items: Mapped[list["QuestionPaperItem"]] = relationship(cascade="all, delete-orphan")


class QuestionPaperItem(Base):
    __tablename__ = "question_paper_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    paper_id: Mapped[int] = mapped_column(ForeignKey("question_papers.id"), index=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id"), index=True)
    section: Mapped[str] = mapped_column(String(20))
    sequence: Mapped[int] = mapped_column(Integer)
    marks: Mapped[int] = mapped_column(Integer)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    actor: Mapped[str] = mapped_column(String(120), index=True)
    action: Mapped[str] = mapped_column(String(120), index=True)
    entity: Mapped[str] = mapped_column(String(120), default="")
    detail: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Settings(Base, TimestampMixin):
    __tablename__ = "settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    institution_name: Mapped[str] = mapped_column(String(180), default="Tech University")
    logo_url: Mapped[str] = mapped_column(String(500), default="")
    similarity_threshold: Mapped[int] = mapped_column(Integer, default=80)
    default_instructions: Mapped[str] = mapped_column(Text, default="")
