# src/repositories/user_repository.py
from sqlalchemy.orm import Session

from src.core.security import get_password_hash
from src.models.user import User
from src.schemas.user import UserCreate


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, *, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def create_user(self, *, user_in: UserCreate) -> User:
        db_user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name,
            role=user_in.role,
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    # Admin utilities
    def set_role(self, user_id: int, role: str) -> User | None:
        user = self.get_by_id(user_id)
        if not user:
            return None
        user.role = role  # expects UserRole-compatible str
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def top_up(self, user_id: int, amount: float, *, commit: bool = True) -> User | None:
        user = self.get_by_id(user_id)
        if not user:
            return None
        user.balance = float(user.balance or 0.0) + float(amount)
        self.db.add(user)
        if commit:
            self.db.commit()
            self.db.refresh(user)
        else:
            # ensure pending writes are flushed so value is up to date
            self.db.flush()
        return user
