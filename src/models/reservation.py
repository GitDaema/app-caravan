from sqlalchemy import Column, Integer, ForeignKey, Date, Float, Enum, Index
from sqlalchemy.orm import relationship
import enum

from src.database.session import Base


class ReservationStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    caravan_id = Column(Integer, ForeignKey("caravans.id"), nullable=False, index=True)
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=False, index=True)
    price = Column(Float, nullable=False)
    status = Column(Enum(ReservationStatus), nullable=False, default=ReservationStatus.PENDING)

    user = relationship("User", backref="reservations")
    caravan = relationship("Caravan", backref="reservations")

    __table_args__ = (
        Index(
            "ix_reservations_caravan_range",
            "caravan_id",
            "start_date",
            "end_date",
        ),
    )

