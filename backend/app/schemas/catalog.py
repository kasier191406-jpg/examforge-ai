from pydantic import BaseModel, Field


class SubjectCreate(BaseModel):
    code: str = Field(min_length=2, max_length=30)
    name: str = Field(min_length=2, max_length=160)
    description: str = ""


class SubjectRead(SubjectCreate):
    id: int
    modules: int = 0


class ModuleCreate(BaseModel):
    subject_id: int
    title: str = Field(min_length=2, max_length=180)
    order_index: int = Field(default=1, ge=1)


class ModuleRead(ModuleCreate):
    id: int


class QuestionCreate(BaseModel):
    subject_id: int
    module_id: int
    text: str = Field(min_length=10)
    marks: int = Field(ge=1, le=100)
    difficulty: str
    bloom_level: str
    question_type: str = "descriptive"
    keywords: str = ""
    model_answer: str = ""
    is_active: bool = True


class QuestionUpdate(BaseModel):
    subject_id: int | None = None
    module_id: int | None = None
    text: str | None = Field(default=None, min_length=10)
    marks: int | None = Field(default=None, ge=1, le=100)
    difficulty: str | None = None
    bloom_level: str | None = None
    question_type: str | None = None
    keywords: str | None = None
    model_answer: str | None = None
    is_active: bool | None = None


class QuestionRead(BaseModel):
    id: int
    subject_id: int
    module_id: int
    subject_name: str
    module_title: str
    text: str
    marks: int
    difficulty: str
    bloom_level: str
    question_type: str
    keywords: str
    model_answer: str
    usage_count: int
    is_active: bool


class TemplateCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    duration_minutes: int = Field(ge=1)
    total_marks: int = Field(ge=1)
    sections: int = Field(default=3, ge=1, le=10)
    instructions: str = ""


class SettingsUpdate(BaseModel):
    institution_name: str = Field(min_length=2, max_length=180)
    logo_url: str = ""
    similarity_threshold: float = Field(ge=0, le=1)
    default_instructions: str = ""


class GeneratePaperRequest(BaseModel):
    title: str = Field(min_length=2)
    subject_id: int
    module_ids: list[int] = Field(default_factory=list)
    total_marks: int = Field(ge=1, le=500)
    duration_minutes: int = Field(ge=1)
    sections: int = Field(default=3, ge=1, le=10)
    difficulty_distribution: dict[str, int] = Field(default_factory=dict)
    bloom_distribution: dict[str, int] = Field(default_factory=dict)
    internal_choices: bool = False


class PaperQuestionRead(BaseModel):
    id: int
    question_id: int
    section: str
    sequence: int
    marks: int
    text: str
    difficulty: str
    bloom_level: str


class PaperRead(BaseModel):
    id: int
    title: str
    subject_id: int
    subject_name: str
    total_marks: int
    duration_minutes: int
    status: str
    created_at: str
    items: list[PaperQuestionRead] = []


class ImportResult(BaseModel):
    imported: int
    skipped: int
    errors: list[str]
