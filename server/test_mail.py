import base64
import email
import logging

from . import mail


class FakeMessages:
    def __init__(self):
        self.sent = []

    def send(self, userId, body):
        self.sent.append(body)
        return self

    def execute(self):
        return {"id": "18f0c0ffee"}


class FakeService:
    def __init__(self):
        self.messages_api = FakeMessages()

    def users(self):
        return self

    def messages(self):
        return self.messages_api


def test_send_mail_logs_recipients_and_message_id(monkeypatch, caplog):
    monkeypatch.setenv("MAIL_ADDRESS", "noreply@example.com")
    monkeypatch.setenv("SERVICE_ACCOUNT_STR", "unused")
    service = FakeService()
    monkeypatch.setattr(mail, "service_account_login", lambda *_: service)
    recipients = ["webkom@example.com", "ola@example.com"]
    body = {"name": "Ola Nordmann", "occasion": "Fest", "amount": 1, "comment": ""}

    with caplog.at_level(logging.INFO):
        mail.send_mail(recipients, body, b"%PDF-1.4 test")

    assert "Sending mail to webkom@example.com, ola@example.com" in caplog.text
    assert (
        "Sent mail to webkom@example.com, ola@example.com (Gmail message id 18f0c0ffee)"
        in caplog.text
    )

    raw = service.messages_api.sent[0]["raw"]
    msg = email.message_from_bytes(base64.urlsafe_b64decode(raw))
    assert msg["From"] == "noreply@example.com"
    assert msg["To"] == "webkom@example.com, ola@example.com"
    attachment = next(
        p for p in msg.walk() if p.get_content_type() == "application/octet-stream"
    )
    assert attachment.get_payload(decode=True) == b"%PDF-1.4 test"
