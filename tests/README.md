## Purpose

This directory exists to satisfy submission / tooling requirements that expect a **top‑level `tests/` folder**.  
It is a navigation entry point only – **no real test code lives here**.

All actual test modules for this project are located under:

- `backend/tests/`

That is where the FastAPI backend and domain logic are exercised with Pytest.

---

## How to Run Tests

From the project root, run:

- Full backend test suite (quiet mode):  
  `pytest backend/tests -q`
- With coverage reporting for `src/`:  
  `pytest --cov=src --cov-report=term-missing backend/tests`

These commands discover and run all test files under `backend/tests/`.

---

## Notes

- Tests are colocated with the backend (`backend/tests/`) because they focus on **API and domain logic**.  
- This top‑level `tests/` folder simply acts as a signpost so that reviewers, CI pipelines, or autograders looking for `./tests` can quickly find where the real tests live.
