import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ToastContainer from '@/app/components/Toast'
import { ToastProvider, useToast } from '@/lib/contexts/ToastContext'

// Test helper component to trigger toasts
function ToastTrigger({ type, message }: { type: 'success' | 'error' | 'warning' | 'info'; message: string }) {
  const toast = useToast()

  return (
    <button onClick={() => toast[type](message)} data-testid={`trigger-${type}`}>
      Show {type}
    </button>
  )
}

// Wrapper for tests
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}

describe('ToastContainer', () => {
  it('renders nothing when there are no toasts', () => {
    const { container } = render(
      <TestWrapper>
        <ToastContainer />
      </TestWrapper>
    )

    // Container should be empty (returns null)
    expect(container.firstChild).toBeNull()
  })

  it('renders success toast', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ToastTrigger type="success" message="Operation successful!" />
        <ToastContainer />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('trigger-success'))

    expect(screen.getByText('Operation successful!')).toBeInTheDocument()
  })

  it('renders error toast', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ToastTrigger type="error" message="Something went wrong!" />
        <ToastContainer />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('trigger-error'))

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument()
  })

  it('renders warning toast', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ToastTrigger type="warning" message="Warning message" />
        <ToastContainer />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('trigger-warning'))

    expect(screen.getByText('Warning message')).toBeInTheDocument()
  })

  it('renders info toast', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ToastTrigger type="info" message="Info message" />
        <ToastContainer />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('trigger-info'))

    expect(screen.getByText('Info message')).toBeInTheDocument()
  })

  it('dismisses toast when close button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ToastTrigger type="success" message="Dismissable toast" />
        <ToastContainer />
      </TestWrapper>
    )

    // Show toast
    await user.click(screen.getByTestId('trigger-success'))
    expect(screen.getByText('Dismissable toast')).toBeInTheDocument()

    // Dismiss it
    await user.click(screen.getByLabelText('Dismiss notification'))

    // Should be gone
    expect(screen.queryByText('Dismissable toast')).not.toBeInTheDocument()
  })

  it('renders multiple toasts', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ToastTrigger type="success" message="First toast" />
        <ToastTrigger type="error" message="Second toast" />
        <ToastContainer />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('trigger-success'))
    await user.click(screen.getByTestId('trigger-error'))

    expect(screen.getByText('First toast')).toBeInTheDocument()
    expect(screen.getByText('Second toast')).toBeInTheDocument()
  })

  it('has accessible dismiss button', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ToastTrigger type="info" message="Test toast" />
        <ToastContainer />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('trigger-info'))

    const dismissButton = screen.getByLabelText('Dismiss notification')
    expect(dismissButton).toBeInTheDocument()
  })

  it('applies correct styling for success variant', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ToastTrigger type="success" message="Success!" />
        <ToastContainer />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('trigger-success'))

    // Find the toast container (parent of the message)
    const toastMessage = screen.getByText('Success!')
    const toastElement = toastMessage.closest('div[class*="emerald"]')
    expect(toastElement).toBeInTheDocument()
  })

  it('applies correct styling for error variant', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ToastTrigger type="error" message="Error!" />
        <ToastContainer />
      </TestWrapper>
    )

    await user.click(screen.getByTestId('trigger-error'))

    const toastMessage = screen.getByText('Error!')
    const toastElement = toastMessage.closest('div[class*="red"]')
    expect(toastElement).toBeInTheDocument()
  })
})

describe('useToast hook', () => {
  it('provides toast methods', () => {
    let toastMethods: ReturnType<typeof useToast> | null = null

    function TestComponent() {
      toastMethods = useToast()
      return null
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(toastMethods).not.toBeNull()
    expect(typeof toastMethods!.success).toBe('function')
    expect(typeof toastMethods!.error).toBe('function')
    expect(typeof toastMethods!.warning).toBe('function')
    expect(typeof toastMethods!.info).toBe('function')
    expect(typeof toastMethods!.addToast).toBe('function')
    expect(typeof toastMethods!.removeToast).toBe('function')
  })
})
