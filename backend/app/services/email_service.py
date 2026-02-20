import logging

import resend

from app.config import settings

logger = logging.getLogger("qwizme.email")


def _send(to: str, subject: str, html: str) -> None:
    resend.api_key = settings.RESEND_API_KEY
    try:
        resend.Emails.send({
            "from": settings.FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html,
        })
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to, e)
        raise
    logger.info("Email sent to %s: %s", to, subject)


def send_verification_email(email: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Verify your email</h2>
      <p>Welcome to Qwiz Me! Click the button below to verify your email address.</p>
      <a href="{link}" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Verify Email</a>
      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">If you didn't create an account, you can ignore this email.</p>
    </div>
    """
    _send(email, "Verify your Qwiz Me email", html)


def send_reset_email(email: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Reset your password</h2>
      <p>We received a request to reset your password. Click the button below to choose a new one.</p>
      <a href="{link}" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Reset Password</a>
      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    </div>
    """
    _send(email, "Reset your Qwiz Me password", html)
