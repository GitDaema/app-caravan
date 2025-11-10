import { render, screen } from '@testing-library/react'
import Landing from '../routes/Landing'
import { withProviders } from '../test/utils'

test('랜딩 페이지에 제목/로그인 링크가 보인다', () => {
  render(withProviders(<Landing />))
  expect(screen.getByText('CaravanShare')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '로그인' })).toBeInTheDocument()
})

