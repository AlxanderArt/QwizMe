import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.dependencies import require_admin, require_founder
from app.database import get_db
from app.limiter import limiter
from app.models.user import User
from app.schemas.admin import (
    AdminAccountResponse,
    CreateAccountBulkRequest,
    CreateAccountRequest,
    PromoteRequest,
)
from app.schemas.auth import UserResponse

logger = logging.getLogger("qwizme.admin")

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/accounts", response_model=AdminAccountResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def create_account(
    request: Request,
    data: CreateAccountRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    # Check for duplicate unclaimed accounts (case-insensitive)
    existing = db.query(User).filter(
        func.lower(User.first_name) == data.first_name.strip().lower(),
        func.lower(User.last_name) == data.last_name.strip().lower(),
        User.onboarding_step == 0,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="An unclaimed account with this name already exists")

    user = User(
        first_name=data.first_name.strip(),
        last_name=data.last_name.strip(),
        onboarding_step=0,
        created_by_id=admin.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/accounts/bulk", response_model=list[AdminAccountResponse], status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def create_accounts_bulk(
    request: Request,
    data: CreateAccountBulkRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    created = []
    skipped = 0
    for account in data.accounts:
        existing = db.query(User).filter(
            func.lower(User.first_name) == account.first_name.strip().lower(),
            func.lower(User.last_name) == account.last_name.strip().lower(),
            User.onboarding_step == 0,
        ).first()
        if existing:
            skipped += 1
            continue

        user = User(
            first_name=account.first_name.strip(),
            last_name=account.last_name.strip(),
            onboarding_step=0,
            created_by_id=admin.id,
        )
        db.add(user)
        db.flush()
        created.append(user)

    db.commit()
    for u in created:
        db.refresh(u)

    if skipped:
        logger.info("Bulk create: %d created, %d skipped (duplicates)", len(created), skipped)

    return created


@router.get("/accounts", response_model=list[AdminAccountResponse])
def list_accounts(
    status_filter: str | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = db.query(User).filter(User.created_by_id.isnot(None))

    if status_filter == "unclaimed":
        query = query.filter(User.onboarding_step == 0)
    elif status_filter == "in_progress":
        query = query.filter(User.onboarding_step > 0, User.onboarding_step < 5)
    elif status_filter == "complete":
        query = query.filter(User.onboarding_step >= 5)

    return query.order_by(User.created_at.desc()).all()


@router.delete("/accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
def delete_account(
    request: Request,
    account_id: int,
    db: Session = Depends(get_db),
    founder: User = Depends(require_founder),
):
    user = db.query(User).filter(User.id == account_id, User.created_by_id.isnot(None)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(user)
    db.commit()


@router.post("/promote")
@limiter.limit("5/minute")
def promote_user(
    request: Request,
    data: PromoteRequest,
    db: Session = Depends(get_db),
    founder: User = Depends(require_founder),
):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "founder":
        raise HTTPException(status_code=400, detail="Cannot change founder role")
    user.role = data.role
    db.commit()
    return {"message": f"User role updated to {data.role}"}


@router.get("/users", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    founder: User = Depends(require_founder),
):
    return db.query(User).order_by(User.created_at.desc()).all()
