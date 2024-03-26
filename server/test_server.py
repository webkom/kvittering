import pytest

from .server import app as server_app


@pytest.fixture()
def app():
    server_app.config.update(
        {
            "TESTING": True,
        }
    )

    return server_app


@pytest.fixture()
def client(app):
    return app.test_client()


def test_index_route(client):
    response = client.get("/")

    assert response.status_code == 200
