def test_register(test_client):
    res = test_client.post("/api/v1/auth/register", json={
        "email": "new@example.com",
        "username": "newuser",
        "password": "password123",
    })
    assert res.status_code == 201
    assert "access_token" in res.json()


def test_register_duplicate_email(test_client):
    test_client.post("/api/v1/auth/register", json={
        "email": "dup@example.com",
        "username": "user1",
        "password": "password123",
    })
    res = test_client.post("/api/v1/auth/register", json={
        "email": "dup@example.com",
        "username": "user2",
        "password": "password123",
    })
    assert res.status_code == 400
    assert "Email already registered" in res.json()["detail"]


def test_register_duplicate_username(test_client):
    test_client.post("/api/v1/auth/register", json={
        "email": "a@example.com",
        "username": "samename",
        "password": "password123",
    })
    res = test_client.post("/api/v1/auth/register", json={
        "email": "b@example.com",
        "username": "samename",
        "password": "password123",
    })
    assert res.status_code == 400
    assert "Username already taken" in res.json()["detail"]


def test_login(test_client):
    test_client.post("/api/v1/auth/register", json={
        "email": "login@example.com",
        "username": "loginuser",
        "password": "password123",
    })
    res = test_client.post("/api/v1/auth/login", json={
        "email": "login@example.com",
        "password": "password123",
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_wrong_password(test_client):
    test_client.post("/api/v1/auth/register", json={
        "email": "wrong@example.com",
        "username": "wronguser",
        "password": "password123",
    })
    res = test_client.post("/api/v1/auth/login", json={
        "email": "wrong@example.com",
        "password": "wrongpassword",
    })
    assert res.status_code == 401


def test_me(auth_client):
    res = auth_client.get("/api/v1/auth/me")
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"


def test_me_unauthorized(test_client):
    res = test_client.get("/api/v1/auth/me")
    assert res.status_code == 401
