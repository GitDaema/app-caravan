# src/services/user_service.py
from sqlalchemy.orm import Session
from src.repositories.user_repository import UserRepository
from src.schemas.user import UserCreate
from src.models.user import User
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
