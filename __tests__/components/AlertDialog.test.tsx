import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AlertDialog from '@/app/components/AlertDialog'

describe('AlertDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Alert Title',
    message: 'This is an alert message.',
    onClose: vi.fn(),
  }

  it('renders nothing when isOpen is false', () => {
    render(<AlertDialog {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Alert Title')).not.toBeInTheDocument()
  })

  it('renders dialog when isOpen is true', () => {
    render(<AlertDialog {...defaultProps} />)

    expect(screen.getByText('Alert Title')).toBeInTheDocument()
    expect(screen.getByText('This is an alert message.')).toBeInTheDocument()
  })

  it('renders default button text', () => {
    render(<AlertDialog {...defaultProps} />)

    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('renders custom button text', () => {
    render(<AlertDialog {...defaultProps} buttonText="Got it" />)

    expect(screen.getByText('Got it')).toBeInTheDocument()
  })

  it('calls onClose when button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<AlertDialog {...defaultProps} onClose={onClose} />)

    await user.click(screen.getByText('OK'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  describe('variants', () => {
    it('renders info variant by default', () => {
      render(<AlertDialog {...defaultProps} />)

      const button = screen.getByText('OK')
      expect(button.className).toContain('cyan')
    })

    it('renders error variant', () => {
      render(<AlertDialog {...defaultProps} variant="error" />)

      const button = screen.getByText('OK')
      expect(button.className).toContain('red')
    })

    it('renders warning variant', () => {
      render(<AlertDialog {...defaultProps} variant="warning" />)

      const button = screen.getByText('OK')
      expect(button.className).toContain('amber')
    })

    it('renders success variant', () => {
      render(<AlertDialog {...defaultProps} variant="success" />)

      const button = screen.getByText('OK')
      expect(button.className).toContain('emerald')
    })
  })

  it('has accessible dialog structure', () => {
    render(<AlertDialog {...defaultProps} />)

    // Title should be a heading
    const title = screen.getByText('Alert Title')
    expect(title.tagName).toBe('H3')

    // Button should be focusable
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('renders icon for each variant', () => {
    const { rerender } = render(<AlertDialog {...defaultProps} variant="error" />)
    expect(document.querySelector('svg')).toBeInTheDocument()

    rerender(<AlertDialog {...defaultProps} variant="warning" />)
    expect(document.querySelector('svg')).toBeInTheDocument()

    rerender(<AlertDialog {...defaultProps} variant="info" />)
    expect(document.querySelector('svg')).toBeInTheDocument()

    rerender(<AlertDialog {...defaultProps} variant="success" />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })
})
