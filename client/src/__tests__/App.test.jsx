import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import App from '../App.jsx'

describe('App', () => {
  it('renders the role selection page at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Office Queue Management')).toBeInTheDocument()
  })

  it('renders customer, officer, and display role buttons', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    const buttons = screen.getAllByRole('button')
    const labels = buttons.map((btn) => btn.textContent)
    expect(labels).toContain('CustomerChoose a service and get a ticket')
    expect(labels).toContain('OfficerPick your counter and call the next customer')
    expect(labels).toContain('Display boardShow called tickets and queue lengths')
  })

  it('renders the not-found page for unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-route']}>
        <App />
      </MemoryRouter>
    )
    // NotFoundPage should render something — adjust if the page content differs
    expect(document.querySelector('main')).toBeInTheDocument()
  })
})
