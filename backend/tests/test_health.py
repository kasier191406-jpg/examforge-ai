from fastapi.testclient import TestClient
from uuid import uuid4

from app.core.database import create_database_schema
from app.main import app
from app.utils.seed import seed_demo_data

create_database_schema()
seed_demo_data()


client = TestClient(app)


def login_headers() -> dict[str, str]:
    response = client.post("/api/v1/auth/login", json={"username": "admin", "password": "Admin@123"})
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def test_health_check() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_login_and_question_crud() -> None:
    headers = login_headers()
    subjects = client.get("/api/v1/subjects", headers=headers).json()
    modules = client.get("/api/v1/modules", headers=headers).json()
    module = next(item for item in modules if item["subject_id"] == subjects[0]["id"])
    payload = {
        "subject_id": subjects[0]["id"],
        "module_id": module["id"],
        "text": "Explain how ExamForge AI validates a generated question against Bloom taxonomy.",
        "marks": 5,
        "difficulty": "Medium",
        "bloom_level": "Understand",
        "question_type": "descriptive",
        "keywords": "bloom, validation",
        "model_answer": "Discuss Bloom levels and validation logic.",
        "is_active": True,
    }

    created = client.post("/api/v1/questions", json=payload, headers=headers)
    assert created.status_code == 201
    question_id = created.json()["id"]

    updated = client.put(
        f"/api/v1/questions/{question_id}",
        json={"marks": 10, "difficulty": "Hard"},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["marks"] == 10

    deleted = client.delete(f"/api/v1/questions/{question_id}", headers=headers)
    assert deleted.status_code == 204


def test_generate_and_export_files() -> None:
    headers = login_headers()
    subject = client.get("/api/v1/subjects", headers=headers).json()[0]
    modules = [
        item["id"]
        for item in client.get("/api/v1/modules", headers=headers).json()
        if item["subject_id"] == subject["id"]
    ]
    response = client.post(
        "/api/v1/generator",
        json={
            "title": "Pytest Generated Paper",
            "subject_id": subject["id"],
            "module_ids": modules,
            "total_marks": 20,
            "duration_minutes": 60,
            "sections": 2,
            "difficulty_distribution": {"Easy": 30, "Medium": 50, "Hard": 20},
            "bloom_distribution": {"Remember": 20, "Understand": 30, "Apply": 50},
            "internal_choices": False,
        },
        headers=headers,
    )
    assert response.status_code == 201
    paper_id = response.json()["id"]
    assert sum(item["marks"] for item in response.json()["items"]) == 20

    pdf = client.get(f"/api/v1/papers/{paper_id}/export/pdf", headers=headers)
    assert pdf.status_code == 200
    assert pdf.content.startswith(b"%PDF")

    docx = client.get(f"/api/v1/papers/{paper_id}/export/docx", headers=headers)
    assert docx.status_code == 200
    assert docx.content.startswith(b"PK")


def test_import_csv_and_settings() -> None:
    headers = login_headers()
    unique_text = f"Describe a production-ready import validation workflow {uuid4()}."
    csv_content = (
        "subject,module,text,marks,difficulty,bloom_level,question_type,keywords,model_answer\n"
        f"Imported Systems,Module A,{unique_text},5,Medium,Apply,descriptive,import,Validate and persist rows.\n"
    )
    response = client.post(
        "/api/v1/import/questions",
        files={"file": ("questions.csv", csv_content, "text/csv")},
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["imported"] >= 1

    settings = client.put(
        "/api/v1/settings",
        json={
            "institution_name": "Tech University QA",
            "logo_url": "",
            "similarity_threshold": 0.75,
            "default_instructions": "Answer all questions.",
        },
        headers=headers,
    )
    assert settings.status_code == 200
    assert settings.json()["institution_name"] == "Tech University QA"
