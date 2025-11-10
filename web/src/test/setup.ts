import '@testing-library/jest-dom'

// Basic fetch mock helper for tests; can be overridden per spec
beforeEach(() => {
  vi.restoreAllMocks()
})

