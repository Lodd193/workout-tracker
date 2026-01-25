import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmptyState, {
  WorkoutIcon,
  DocumentIcon,
  TemplateIcon,
  TargetIcon,
  ChartIcon,
  SearchIcon,
} from '@/app/components/EmptyState'

describe('EmptyState', () => {
  const mockIcon = <div data-testid="mock-icon">Icon</div>

  it('renders title and description', () => {
    render(
      <EmptyState
        icon={mockIcon}
        title="No workouts yet"
        description="Start your fitness journey today!"
      />
    )

    expect(screen.getByText('No workouts yet')).toBeInTheDocument()
    expect(screen.getByText('Start your fitness journey today!')).toBeInTheDocument()
  })

  it('renders the provided icon', () => {
    render(
      <EmptyState
        icon={mockIcon}
        title="No workouts"
        description="Get started"
      />
    )

    expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
  })

  it('renders without action buttons when not provided', () => {
    render(
      <EmptyState
        icon={mockIcon}
        title="No workouts"
        description="Get started"
      />
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders primary action button', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <EmptyState
        icon={mockIcon}
        title="No workouts"
        description="Get started"
        action={{ label: 'Add Workout', onClick }}
      />
    )

    const button = screen.getByText('Add Workout')
    expect(button).toBeInTheDocument()

    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders secondary action button', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <EmptyState
        icon={mockIcon}
        title="No workouts"
        description="Get started"
        secondaryAction={{ label: 'Learn More', onClick }}
      />
    )

    const button = screen.getByText('Learn More')
    expect(button).toBeInTheDocument()

    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders both action and secondary action', () => {
    render(
      <EmptyState
        icon={mockIcon}
        title="No workouts"
        description="Get started"
        action={{ label: 'Add Workout', onClick: vi.fn() }}
        secondaryAction={{ label: 'Learn More', onClick: vi.fn() }}
      />
    )

    expect(screen.getByText('Add Workout')).toBeInTheDocument()
    expect(screen.getByText('Learn More')).toBeInTheDocument()
  })

  it('renders primary variant action button with gradient styling', () => {
    render(
      <EmptyState
        icon={mockIcon}
        title="No workouts"
        description="Get started"
        action={{ label: 'Add Workout', onClick: vi.fn(), variant: 'primary' }}
      />
    )

    const button = screen.getByText('Add Workout')
    expect(button.className).toContain('emerald')
  })

  it('renders secondary variant action button with slate styling', () => {
    render(
      <EmptyState
        icon={mockIcon}
        title="No workouts"
        description="Get started"
        action={{ label: 'Add Workout', onClick: vi.fn(), variant: 'secondary' }}
      />
    )

    const button = screen.getByText('Add Workout')
    expect(button.className).toContain('slate')
  })

  it('has accessible structure with heading', () => {
    render(
      <EmptyState
        icon={mockIcon}
        title="No workouts"
        description="Get started"
      />
    )

    const title = screen.getByText('No workouts')
    expect(title.tagName).toBe('H3')
  })
})

describe('Icon Components', () => {
  it('renders WorkoutIcon', () => {
    render(<WorkoutIcon />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders WorkoutIcon with custom className', () => {
    render(<WorkoutIcon className="w-8 h-8" />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveClass('w-8', 'h-8')
  })

  it('renders DocumentIcon', () => {
    render(<DocumentIcon />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders TemplateIcon', () => {
    render(<TemplateIcon />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders TargetIcon', () => {
    render(<TargetIcon />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders ChartIcon', () => {
    render(<ChartIcon />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders SearchIcon', () => {
    render(<SearchIcon />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('all icons use default w-16 h-16 className', () => {
    const icons = [WorkoutIcon, DocumentIcon, TemplateIcon, TargetIcon, ChartIcon, SearchIcon]

    icons.forEach((Icon, index) => {
      const { unmount } = render(<Icon />)
      const svg = document.querySelector('svg')
      expect(svg).toHaveClass('w-16', 'h-16')
      unmount()
    })
  })
})
