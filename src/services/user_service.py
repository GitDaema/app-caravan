# src/services/user_service.py
from sqlalchemy.orm import Session
from src.repositories.user_repository import UserRepository
from src.schemas.user import UserCreate
from src.models.user import User, UserRole
from src.exceptions.user_exceptions import UserAlreadyExistsError


class UserService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def create_user(self, *, user_in: UserCreate) -> User:
        """
        Create a new user.
        - Checks if a user with the same email already exists.
        - Hashes the password.
        - Creates the user in the database.
        """
        existing_user = self.user_repo.get_user_by_email(email=user_in.email)
        if existing_user:
            raise UserAlreadyExistsError(email=user_in.email)

        return self.user_repo.create_user(user_in=user_in)

    # Admin-only actions
    def promote_to_host(self, user_id: int) -> User:
        user = self.user_repo.set_role(user_id, UserRole.HOST)
        if not user:
            raise ValueError("user_not_found")
        return user

    def set_role(self, user_id: int, role: UserRole) -> User:
        user = self.user_repo.set_role(user_id, role)
        if not user:
            raise ValueError("user_not_found")
        return user

    def top_up(self, user_id: int, amount: float) -> User:
        if amount <= 0:
            raise ValueError("amount_must_be_positive")
        user = self.user_repo.top_up(user_id, amount)
        if not user:
            raise ValueError("user_not_found")
        return user
