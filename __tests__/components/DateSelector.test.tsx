import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DateSelector from '@/app/components/DateSelector'

describe('DateSelector', () => {
  const mockOnChange = vi.fn()
  const mockOnError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock Date.now for consistent testing
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-25T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Helper to get the date input
  const getDateInput = () => {
    return document.querySelector('input[type="date"]') as HTMLInputElement
  }

  describe('rendering', () => {
    it('renders date input', () => {
      render(<DateSelector value="" onChange={mockOnChange} />)
      expect(getDateInput()).toBeInTheDocument()
    })

    it('renders preset buttons by default', () => {
      render(<DateSelector value="" onChange={mockOnChange} />)
      expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Yesterday' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '2 Days Ago' })).toBeInTheDocument()
    })

    it('hides preset buttons when showPresets is false', () => {
      render(<DateSelector value="" onChange={mockOnChange} showPresets={false} />)
      expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument()
    })

    it('renders with initial value', () => {
      render(<DateSelector value="2026-01-20" onChange={mockOnChange} />)
      expect(getDateInput().value).toBe('2026-01-20')
    })
  })

  describe('preset buttons', () => {
    it('sets today date when Today is clicked', () => {
      render(<DateSelector value="" onChange={mockOnChange} />)
      fireEvent.click(screen.getByRole('button', { name: 'Today' }))
      expect(mockOnChange).toHaveBeenCalledWith('2026-01-25')
    })

    it('sets yesterday date when Yesterday is clicked', () => {
      render(<DateSelector value="" onChange={mockOnChange} />)
      fireEvent.click(screen.getByRole('button', { name: 'Yesterday' }))
      expect(mockOnChange).toHaveBeenCalledWith('2026-01-24')
    })

    it('sets 2 days ago when 2 Days Ago is clicked', () => {
      render(<DateSelector value="" onChange={mockOnChange} />)
      fireEvent.click(screen.getByRole('button', { name: '2 Days Ago' }))
      expect(mockOnChange).toHaveBeenCalledWith('2026-01-23')
    })
  })

  describe('custom presets', () => {
    it('renders custom preset buttons', () => {
      const customPresets = [
        { label: 'This Week', daysOffset: 0 },
        { label: 'Last Week', daysOffset: -7 },
      ]
      render(<DateSelector value="" onChange={mockOnChange} presets={customPresets} />)
      expect(screen.getByRole('button', { name: 'This Week' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Last Week' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument()
    })
  })

  describe('date input', () => {
    it('calls onChange when date is entered', () => {
      render(<DateSelector value="" onChange={mockOnChange} />)
      const input = getDateInput()
      fireEvent.change(input, { target: { value: '2026-01-20' } })
      expect(mockOnChange).toHaveBeenCalledWith('2026-01-20')
    })

    it('clears error when date is cleared', () => {
      render(<DateSelector value="2026-01-20" onChange={mockOnChange} onError={mockOnError} />)
      const input = getDateInput()
      fireEvent.change(input, { target: { value: '' } })
      expect(mockOnError).toHaveBeenCalledWith('')
    })
  })

  describe('validation', () => {
    it('shows error for future dates when allowFuture is false', () => {
      render(<DateSelector value="" onChange={mockOnChange} onError={mockOnError} />)
      const input = getDateInput()
      fireEvent.change(input, { target: { value: '2026-02-01' } })
      expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('future'))
    })

    it('shows error for dates too far in past', () => {
      render(
        <DateSelector value="" onChange={mockOnChange} onError={mockOnError} maxDaysInPast={30} />
      )
      const input = getDateInput()
      fireEvent.change(input, { target: { value: '2025-01-01' } })
      expect(mockOnError).toHaveBeenCalled()
    })

    it('allows future dates when allowFuture is true', () => {
      render(
        <DateSelector
          value=""
          onChange={mockOnChange}
          onError={mockOnError}
          allowFuture={true}
        />
      )
      const input = getDateInput()
      fireEvent.change(input, { target: { value: '2026-02-01' } })
      expect(mockOnError).toHaveBeenCalledWith('')
    })

    it('shows error message in UI', () => {
      render(<DateSelector value="" onChange={mockOnChange} />)
      const input = getDateInput()
      fireEvent.change(input, { target: { value: '2026-12-01' } })
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has accessible label', () => {
      render(<DateSelector value="" onChange={mockOnChange} />)
      expect(screen.getByText('Date')).toBeInTheDocument()
    })

    it('shows error with alert role', () => {
      render(<DateSelector value="" onChange={mockOnChange} />)
      const input = getDateInput()
      fireEvent.change(input, { target: { value: '2026-12-01' } })
      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent(/future/i)
    })
  })
})
