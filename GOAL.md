````markdown
# 바이브코딩 실전 문제: 카라반 공유 앱
시나리오 기반 설계 및 구현 과제

--------------------------------------------

## 프로젝트 개요

### 서비스 개념
CaravanShare: 카라반(캠핑카)을 소유한 사람과 이용하고 싶은 사람을 연결하는 공유 플랫폼

- 공급자(호스트): 카라반을 소유하고 임대하려는 사람
- 수요자(게스트): 카라반을 빌려 여행하고 싶은 사람
- 핵심 가치: 유휴 자산의 활용, 저렴한 여행 경험, 커뮤니티

--------------------------------------------

## 핵심 요구사항 (Phase 1: MVP)

### 1. 사용자 관리
- 회원가입 (호스트/게스트 구분)
- 프로필 관리 (이름, 연락처, 평가, 신원 확인)
- 인증/인가 (로그인, 권한 관리)
- 사용자 신뢰도 시스템

### 2. 카라반 정보 관리
- 카라반 등록 (호스트)
- 카라반 정보: 수용 인원, 편의시설, 사진, 위치
- 카라반 검색/조회 (게스트)
- 카라반 상태 관리 (사용가능, 예약됨, 정비중)

### 3. 예약 시스템
- 예약 신청 (게스트)
- 예약 승인/거절 (호스트)
- 예약 날짜 관리 (캘린더)
- 중복 예약 방지

### 4. 결제 및 가격
- 일일 요금 설정 (호스트)
- 가격 계산 (렌탈 기간 기반)
- 선결제 시스템
- 결제 이력 조회

### 5. 리뷰/평가
- 거래 후 리뷰 작성
- 평점 시스템 (1~5점)
- 호스트/게스트 신뢰도 반영

--------------------------------------------

## 문제점 분석 (나쁜 설계 예시)

### 코드 예시
```python
class CaravanApp:
    def __init__(self):
        self.users = []
        self.caravans = []
        self.reservations = []
        self.reviews = []
        self.payments = []

    def create_reservation(self, user_id, caravan_id, start_date, end_date, price):
        user = None
        for u in self.users:
            if u['id'] == user_id:
                user = u
                break

        caravan = None
        for c in self.caravans:
            if c['id'] == caravan_id:
                caravan = c
                break

        if user is None or caravan is None:
            return False

        for r in self.reservations:
            if (r['caravan_id'] == caravan_id and
                ((start_date >= r['start_date'] and start_date <= r['end_date']) or
                 (end_date >= r['start_date'] and end_date <= r['end_date']))):
                return False

        if user['balance'] < price:
            return False

        user['balance'] -= price

        reservation = {
            'id': len(self.reservations) + 1,
            'user_id': user_id,
            'caravan_id': caravan_id,
            'start_date': start_date,
            'end_date': end_date,
            'status': 'pending',
            'price': price
        }

        self.reservations.append(reservation)
        return True

    def get_caravan_info(self, caravan_id):
        for c in self.caravans:
            if c['id'] == caravan_id:
                return c
        return None
````

### 문제점

1. 단일 책임 원칙 위반: 모든 기능이 하나의 클래스에 집중
2. 낮은 응집도: 인증, 프로필, 결제 로직이 뒤섞임
3. 비효율적인 검색: 리스트 순회로 O(n)
4. 중복 코드: 검색 및 예약 검증 반복
5. 강한 결합도: 결제와 예약 로직 결합
6. 테스트 불가능: 하드코딩된 의존성

---

## 과제 1: 깨끗한 도메인 모델 설계

목표: 책임 분리 및 응집도 높은 구조 설계

요구사항:

* User 클래스: 사용자 관리
* Caravan 클래스: 카라반 정보 관리
* Reservation 클래스: 예약 관리
* Payment 클래스: 결제 처리
* Review 클래스: 리뷰 관리

설계 원칙:

* 단일 책임 원칙 (SRP)
* 개방/폐쇄 원칙 (OCP)
* 의존성 역전 원칙 (DIP)

---

## 과제 2: 복잡한 비즈니스 로직 분리

목표: 예약 검증 로직 분리 및 명확화

요구사항:

* ReservationValidator 클래스 설계
* 각 검증 로직을 개별 메서드로 분리
* 독립적으로 테스트 가능해야 함

---

## 과제 3: 효율적인 데이터 구조와 검색 알고리즘

목표: 성능 최적화 및 가독성 향상

요구사항:

* ReservationRepository 클래스 설계
* 인덱싱을 통한 O(1) 검색 구현
* 날짜별 충돌 검사 최적화

---

## 과제 4: 변수명과 함수명의 명확성

목표: 자기설명적 코드 작성

네이밍 가이드:

* 변수명: user_id (not uid)
* 함수명: 동사로 시작 (create_, validate_)
* Boolean 함수: is_, has_, can_ 접두사
* 상수: 대문자 (MIN_RESERVATION_DAYS = 1)

---

## 과제 5: 에러 처리와 예외 관리

목표: 견고한 에러 처리 전략 수립

요구사항:

* 커스텀 예외 클래스 정의
* 상황별 예외 처리
* 명확한 에러 메시지 제공

---

## 과제 6: 테스트 가능한 코드 작성

목표: 단위 테스트 작성 가능 구조

요구사항:

* 의존성 주입 (Dependency Injection) 적용
* Mock 객체 활용
* 테스트 커버리지 70% 이상

---

## 과제 7: 디자인 패턴 적용

목표: 적절한 패턴 활용

패턴 활용:

* 팩토리 패턴: 예약 객체 생성
* 전략 패턴: 할인 계산
* 옵저버 패턴: 알림 처리
* 리포지토리 패턴: 데이터 접근

---

## 구현 평가 기준

### 1단계 (기본)

* [ ] 클래스가 단일 책임 원칙을 따르는가?
* [ ] 변수명과 함수명이 명확한가?
* [ ] 중복 코드가 없는가?

### 2단계 (중급)

* [ ] 에러 처리가 명확한가?
* [ ] 의존성이 주입되는가?
* [ ] 단위 테스트가 작성되었는가?

### 3단계 (고급)

* [ ] 디자인 패턴이 적절히 적용되었는가?
* [ ] 코드 복잡도가 낮은가?
* [ ] 성능 최적화가 고려되었는가?

코드 품질 지표:

* 순환 복잡도 ≤ 10
* 함수 길이 ≤ 30줄
* 클래스 크기 ≤ 200줄
* 테스트 커버리지 ≥ 70%

---

## 추가 발전 과제

### Phase 2: 고급 기능

* 실시간 알림 시스템
* 평가 및 추천 시스템
* 결제 및 정산
* 지도/위치 기반 서비스

### Phase 3: 시스템 설계

* 마이크로서비스 아키텍처
* 데이터베이스 설계
* 확장성 고려

---

## 제출 형식

```
your_project/
├── src/
│   ├── models/
│   ├── services/
│   ├── repositories/
│   └── exceptions/
├── tests/
├── README.md
├── DESIGN.md
└── requirements.txt
```

---

## 바이브코딩 핵심 포인트

* 깨끗한 코드의 중요성
* 좋은 설계의 영향
* 도메인 이해의 중요성
* 점진적 개선
* 테스트의 힘