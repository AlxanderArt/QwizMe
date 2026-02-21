import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.verification_code import VerificationCode


def _hash_code(code: str) -> str:
    return hashlib.sha256(code.encode()).hexdigest()


def generate_code() -> tuple[str, str]:
    plain = str(secrets.randbelow(900000) + 100000)
    return plain, _hash_code(plain)


def store_code(db: Session, user_id: int, purpose: str) -> str:
    # Invalidate previous codes for same user+purpose
    db.query(VerificationCode).filter(
        VerificationCode.user_id == user_id,
        VerificationCode.purpose == purpose,
    ).delete()

    plain, code_hash = generate_code()
    vc = VerificationCode(
        user_id=user_id,
        code_hash=code_hash,
        purpose=purpose,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
    )
    db.add(vc)
    db.commit()
    return plain


def verify_code(db: Session, user_id: int, purpose: str, plain_code: str) -> bool:
    vc = (
        db.query(VerificationCode)
        .filter(
            VerificationCode.user_id == user_id,
            VerificationCode.purpose == purpose,
        )
        .order_by(VerificationCode.created_at.desc())
        .first()
    )
    if not vc:
        return False

    if vc.attempts >= 5:
        return False

    if datetime.now(timezone.utc) > vc.expires_at:
        return False

    vc.attempts += 1
    db.commit()

    if _hash_code(plain_code) != vc.code_hash:
        return False

    # Code verified — clean up
    db.delete(vc)
    db.commit()
    return True
