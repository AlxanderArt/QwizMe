SAMPLE_QUIZ = {
    "title": "Test Quiz",
    "questions": [
        {
            "question_text": "What is 2+2?",
            "explanation": "Basic addition",
            "answers": [
                {"answer_text": "4", "is_correct": True},
                {"answer_text": "3", "is_correct": False},
                {"answer_text": "5", "is_correct": False},
            ],
        },
        {
            "question_text": "What color is the sky?",
            "explanation": "Look up",
            "answers": [
                {"answer_text": "Blue", "is_correct": True},
                {"answer_text": "Red", "is_correct": False},
            ],
        },
    ],
}


def test_create_quiz(auth_client):
    res = auth_client.post("/api/v1/quizzes", json=SAMPLE_QUIZ)
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Test Quiz"
    assert data["question_count"] == 2
    assert data["source_type"] == "manual"


def test_list_quizzes(auth_client):
    auth_client.post("/api/v1/quizzes", json=SAMPLE_QUIZ)
    res = auth_client.get("/api/v1/quizzes")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert len(data["quizzes"]) == 1
    assert data["has_more"] is False


def test_pagination(auth_client):
    for i in range(3):
        auth_client.post("/api/v1/quizzes", json={**SAMPLE_QUIZ, "title": f"Quiz {i}"})

    res = auth_client.get("/api/v1/quizzes", params={"skip": 0, "limit": 2})
    data = res.json()
    assert len(data["quizzes"]) == 2
    assert data["total"] == 3
    assert data["has_more"] is True

    res2 = auth_client.get("/api/v1/quizzes", params={"skip": 2, "limit": 2})
    data2 = res2.json()
    assert len(data2["quizzes"]) == 1
    assert data2["has_more"] is False


def test_get_quiz(auth_client):
    create_res = auth_client.post("/api/v1/quizzes", json=SAMPLE_QUIZ)
    quiz_id = create_res.json()["id"]

    res = auth_client.get(f"/api/v1/quizzes/{quiz_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "Test Quiz"
    assert len(data["questions"]) == 2


def test_delete_quiz(auth_client):
    create_res = auth_client.post("/api/v1/quizzes", json=SAMPLE_QUIZ)
    quiz_id = create_res.json()["id"]

    res = auth_client.delete(f"/api/v1/quizzes/{quiz_id}")
    assert res.status_code == 204

    res2 = auth_client.get(f"/api/v1/quizzes/{quiz_id}")
    assert res2.status_code == 404


def test_submit_quiz(auth_client):
    create_res = auth_client.post("/api/v1/quizzes", json=SAMPLE_QUIZ)
    quiz_id = create_res.json()["id"]

    res = auth_client.post(f"/api/v1/quizzes/{quiz_id}/submit", json={"answers": [0, 0]})
    assert res.status_code == 200
    data = res.json()
    assert data["score"] == 2
    assert data["total_questions"] == 2
    assert data["percentage"] == 100.0


def test_submit_wrong_answers(auth_client):
    create_res = auth_client.post("/api/v1/quizzes", json=SAMPLE_QUIZ)
    quiz_id = create_res.json()["id"]

    res = auth_client.post(f"/api/v1/quizzes/{quiz_id}/submit", json={"answers": [1, 1]})
    assert res.status_code == 200
    assert res.json()["score"] == 0


def test_submit_wrong_count(auth_client):
    create_res = auth_client.post("/api/v1/quizzes", json=SAMPLE_QUIZ)
    quiz_id = create_res.json()["id"]

    res = auth_client.post(f"/api/v1/quizzes/{quiz_id}/submit", json={"answers": [0]})
    assert res.status_code == 400


def test_quiz_not_found(auth_client):
    res = auth_client.get("/api/v1/quizzes/9999")
    assert res.status_code == 404
