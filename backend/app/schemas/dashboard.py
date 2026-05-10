from pydantic import BaseModel


class KpiCard(BaseModel):
    label: str
    value: int
    trend: str


class ChartPoint(BaseModel):
    name: str
    value: int


class RecentActivity(BaseModel):
    actor: str
    action: str
    detail: str
    created_at: str


class DashboardResponse(BaseModel):
    kpis: list[KpiCard]
    bloom_distribution: list[ChartPoint]
    difficulty_breakdown: list[ChartPoint]
    recent_activity: list[RecentActivity]
