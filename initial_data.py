# initial_data.py
import logging
import os
from src.database.session import engine, SessionLocal
from src.database.session import Base
from src.models.user import User, UserRole
from src.models.caravan import Caravan
from src.models.reservation import Reservation
from src.schemas.user import UserCreate
from src.services.user_service import UserService
from src.repositories.user_repository import UserRepository
from src.repositories.caravan_repository import CaravanRepository
from src.schemas.caravan import CaravanCreate


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    # Create all tables
    logger.info("Recreating all tables in database (drop + create) for development...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    logger.info("Tables recreated.")

    db = SessionLocal()
    user_repo = UserRepository(db)
    user_service = UserService(db)
    caravan_repo = CaravanRepository(db)

    # Check if an admin user already exists
    admin_user = user_repo.get_user_by_email(email="admin@example.com")
    if not admin_user:
        logger.info("Creating initial admin user...")
        user_in = UserCreate(
            email="admin@example.com",
            password="password",
            full_name="Admin User",
            role=UserRole.ADMIN,
        )
        user = user_service.create_user(user_in=user_in)
        # Seed some balance for testing
        user.balance = 1000.0
        db.add(user)
        db.commit()
        logger.info("Initial admin user created.")
    else:
        logger.info("Admin user already exists. Skipping creation.")

    # Optional demo seed
    if os.getenv("SEED_DEMO", "0") in ("1", "true", "True"):
        logger.info("Seeding demo host and caravan (SEED_DEMO=1)...")
        host_email = "host@example.com"
        host = user_repo.get_user_by_email(email=host_email)
        if not host:
            host = user_service.create_user(
                user_in=UserCreate(
                    email=host_email,
                    password="password",
                    full_name="Demo Host",
                    role=UserRole.HOST,
                )
            )
            host.balance = 500.0
            db.add(host)
            db.commit()
        # Create a demo caravan if none exists
        existing = db.query(Caravan).first()
        if not existing:
            caravan_repo.create(
                caravan_in=CaravanCreate(
                    name="Demo Caravan",
                    description="A comfy demo caravan",
                    capacity=4,
                    amenities="AC,Fridge",
                    location="Seoul",
                    price_per_day=120.0,
                ),
                host_id=host.id,
            )
        logger.info("Demo seed done.")

    db.close()

if __name__ == "__main__":
    logger.info("Starting database initialization...")
    init_db()
    logger.info("Database initialization finished.")
