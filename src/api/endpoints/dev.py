from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api import deps
from src.repositories.caravan_repository import CaravanRepository
from src.repositories.reservation_repository import ReservationRepository
from src.repositories.user_repository import UserRepository


class CaravanBrief(BaseModel):
    id: int
    name: str
    location: str
    host_id: int


class ReservationBrief(BaseModel):
    id: int
    user_id: int
    caravan_id: int
    start_date: str
    end_date: str
    status: str


class DemoOverview(BaseModel):
    demo: bool
    caravans: list[CaravanBrief]
    reservations: list[ReservationBrief]


router = APIRouter()


@router.get("/overview", response_model=DemoOverview)
def demo_overview(db: Session = Depends(deps.get_db)):
    """
    데모 시드가 적용된 경우, 현재 캐러밴/예약 요약을 반환합니다.
    데모 데이터(host@example.com + "Demo Caravan")가 없으면 404.
    """
    user_repo = UserRepository(db)
    caravan_repo = CaravanRepository(db)
    reservation_repo = ReservationRepository(db)

    demo_host = user_repo.get_user_by_email(email="host@example.com")
    demo_caravans = [c for c in caravan_repo.get_multi(limit=1000) if c.name == "Demo Caravan"]

    if not demo_host or not demo_caravans:
        # 데모 시드가 없어도 200으로 빈 데이터 반환하여 404 로그를 방지
        return DemoOverview(demo=False, caravans=[], reservations=[])

    caravans = [
        CaravanBrief(id=c.id, name=c.name, location=c.location, host_id=c.host_id)
        for c in caravan_repo.get_multi(limit=100)
    ]
    # 간단히 최근 100개만 노출
    res = []
    for r in reservation_repo.list_by_user(user_id=demo_host.id, skip=0, limit=100):
        res.append(
            ReservationBrief(
                id=r.id,
                user_id=r.user_id,
                caravan_id=r.caravan_id,
                start_date=r.start_date.isoformat(),
                end_date=r.end_date.isoformat(),
                status=str(r.status.value if hasattr(r.status, "value") else r.status),
            )
        )

    return DemoOverview(demo=True, caravans=caravans, reservations=res)
