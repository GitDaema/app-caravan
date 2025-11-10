# initial_data.py
import logging
from src.database.session import engine, SessionLocal
from src.database.session import Base
from src.models.user import User, UserRole
from src.schemas.user import UserCreate
from src.crud.crud_user import create_user

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    # Create all tables
    logger.info("Creating all tables in database...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created.")

    db = SessionLocal()

    # Check if an admin user already exists
    admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()
    if not admin_user:
        logger.info("Creating initial admin user...")
        user_in = UserCreate(
            email="admin@example.com",
            password="password",
            full_name="Admin User",
            role=UserRole.ADMIN,
        )
        create_user(db, user_in=user_in)
        logger.info("Initial admin user created.")
    else:
        logger.info("Admin user already exists. Skipping creation.")
    
    db.close()

if __name__ == "__main__":
    logger.info("Starting database initialization...")
    init_db()
    logger.info("Database initialization finished.")
