import tempfile
import unittest
from fastapi.testclient import TestClient
from backend.app import create_app


class BackendTest(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.token = "unit-test-token-" * 4
        self.app = create_app(self.folder.name, self.token)
        self.client = TestClient(self.app)
        self.addCleanup(self.client.close)

    def login(self):
        self.assertEqual(
            self.client.post("/api/login", json={"token": self.token}).status_code, 200
        )

    def test_auth_and_csrf(self):
        self.assertEqual(self.client.get("/api/data").status_code, 401)
        self.assertEqual(
            self.client.post("/api/login", json={"token": "wrong"}).status_code, 401
        )
        self.assertEqual(
            self.client.post(
                "/api/login",
                json={"token": self.token},
                headers={"Origin": "https://other.test"},
            ).status_code,
            403,
        )
        self.login()
        self.assertEqual(self.client.get("/api/data").status_code, 200)
        self.assertEqual(
            self.client.put(
                "/api/data",
                json={"revision": 0, "value": {}},
                headers={"Origin": "https://other.test"},
            ).status_code,
            403,
        )

    def test_persistence_conflict_and_restart(self):
        self.login()
        value = {"devices": [{"id": "1", "title": "设备", "status": "borrowed"}]}
        self.assertEqual(
            self.client.put("/api/data", json={"revision": 0, "value": value}).json(),
            {"revision": 1},
        )
        self.assertEqual(
            self.client.put("/api/data", json={"revision": 0, "value": {}}).status_code,
            409,
        )
        with TestClient(create_app(self.folder.name, self.token)) as restarted:
            r = restarted.get(
                "/api/data", headers={"Authorization": "Bearer " + self.token}
            )
            self.assertEqual(r.json(), {"revision": 1, "value": value})

    def test_isolated_installations_and_input_validation(self):
        self.login()
        self.client.put(
            "/api/data", json={"revision": 0, "value": {"private": "record"}}
        )
        with (
            tempfile.TemporaryDirectory() as other,
            TestClient(create_app(other, "other-" * 8)) as isolated,
        ):
            self.assertEqual(
                isolated.get(
                    "/api/data", headers={"Authorization": "Bearer " + self.token}
                ).status_code,
                401,
            )
            self.assertEqual(
                isolated.get(
                    "/api/data", headers={"Authorization": "Bearer " + "other-" * 8}
                ).json()["value"],
                {},
            )
        self.assertEqual(
            self.client.put(
                "/api/data", json={"revision": -1, "value": {}}
            ).status_code,
            422,
        )
        self.assertEqual(
            self.client.put("/api/data", json={"revision": 1, "value": []}).status_code,
            422,
        )
        self.assertEqual(self.client.get("/backend/app.py").status_code, 404)


if __name__ == "__main__":
    unittest.main()
