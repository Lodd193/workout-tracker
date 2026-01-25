import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmDialog from '@/app/components/ConfirmDialog'

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  it('renders nothing when isOpen is false', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument()
  })

  it('renders dialog when isOpen is true', () => {
    render(<ConfirmDialog {...defaultProps} />)

    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
  })

  it('renders default button texts', () => {
    render(<ConfirmDialog {...defaultProps} />)

    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('renders custom button texts', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmText="Delete"
        cancelText="Keep"
      />
    )

    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Keep')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)

    await user.click(screen.getByText('Confirm'))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />)

    await user.click(screen.getByText('Cancel'))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('renders with danger variant by default', () => {
    render(<ConfirmDialog {...defaultProps} />)

    const confirmButton = screen.getByText('Confirm')
    expect(confirmButton.className).toContain('red')
  })

  it('renders with warning variant when specified', () => {
    render(<ConfirmDialog {...defaultProps} variant="warning" />)

    const confirmButton = screen.getByText('Confirm')
    expect(confirmButton.className).toContain('amber')
  })

  it('has accessible dialog structure', () => {
    render(<ConfirmDialog {...defaultProps} />)

    // Title should be a heading
    const title = screen.getByText('Confirm Action')
    expect(title.tagName).toBe('H3')

    // Buttons should be focusable
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
  })
})
