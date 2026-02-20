SAMPLE_QUIZ = {
    "title": "Stats Quiz",
    "questions": [
        {
            "question_text": "Q1?",
            "explanation": "E1",
            "answers": [
                {"answer_text": "A", "is_correct": True},
                {"answer_text": "B", "is_correct": False},
            ],
        },
        {
            "question_text": "Q2?",
            "explanation": "E2",
            "answers": [
                {"answer_text": "C", "is_correct": True},
                {"answer_text": "D", "is_correct": False},
            ],
        },
    ],
}


def test_stats_empty(auth_client):
    res = auth_client.get("/api/v1/stats")
    assert res.status_code == 200
    data = res.json()
    assert data["total_quizzes_created"] == 0
    assert data["total_quizzes_taken"] == 0
    assert data["average_score"] == 0
    assert data["best_score"] == 0
    assert data["recent_attempts"] == []


def test_stats_after_quiz(auth_client):
    create_res = auth_client.post("/api/v1/quizzes", json=SAMPLE_QUIZ)
    quiz_id = create_res.json()["id"]

    auth_client.post(f"/api/v1/quizzes/{quiz_id}/submit", json={"answers": [0, 0]})

    res = auth_client.get("/api/v1/stats")
    data = res.json()
    assert data["total_quizzes_created"] == 1
    assert data["total_quizzes_taken"] == 1
    assert data["average_score"] == 100.0
    assert data["best_score"] == 100.0
    assert len(data["recent_attempts"]) == 1


def test_stats_multiple_attempts(auth_client):
    create_res = auth_client.post("/api/v1/quizzes", json=SAMPLE_QUIZ)
    quiz_id = create_res.json()["id"]

    auth_client.post(f"/api/v1/quizzes/{quiz_id}/submit", json={"answers": [0, 0]})
    auth_client.post(f"/api/v1/quizzes/{quiz_id}/submit", json={"answers": [0, 1]})

    res = auth_client.get("/api/v1/stats")
    data = res.json()
    assert data["total_quizzes_taken"] == 2
    assert data["best_score"] == 100.0
    assert data["average_score"] == 75.0
    assert len(data["recent_attempts"]) == 2
