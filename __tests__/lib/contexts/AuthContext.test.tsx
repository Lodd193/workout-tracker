import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'

// Create mock user data
const mockUser = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
}

// Create mock session data
const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
}

// Auth state change callback holder
let authStateChangeCallback: ((event: string, session: typeof mockSession | null) => void) | null =
  null

// Mock functions - declared before vi.mock
const mockGetSession = vi.fn()
const mockOnAuthStateChange = vi.fn()
const mockSignInWithPassword = vi.fn()
const mockSignUp = vi.fn()
const mockSignOut = vi.fn()
const mockResetPasswordForEmail = vi.fn()
const mockUpdateUser = vi.fn()
const mockFromInsert = vi.fn().mockResolvedValue({ data: null, error: null })

// Mock RPC function for account lockout
const mockRpc = vi.fn()

// Mock the supabase module - must use inline factory
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (callback: (event: string, session: typeof mockSession | null) => void) =>
        mockOnAuthStateChange(callback),
      signInWithPassword: (params: { email: string; password: string }) =>
        mockSignInWithPassword(params),
      signUp: (params: { email: string; password: string }) => mockSignUp(params),
      signOut: () => mockSignOut(),
      resetPasswordForEmail: (email: string, options: { redirectTo: string }) =>
        mockResetPasswordForEmail(email, options),
      updateUser: (params: { password: string }) => mockUpdateUser(params),
    },
    from: () => ({
      insert: mockFromInsert,
    }),
    rpc: (name: string, params: Record<string, unknown>) => mockRpc(name, params),
  },
}))

// Mock the logger module
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

// Mock the templates module
vi.mock('@/lib/templates', () => ({
  migrateLocalStorageTemplates: vi.fn().mockResolvedValue(0),
}))

// Mock the audit log module
vi.mock('@/lib/audit/auditLog', () => ({
  logLogin: vi.fn(),
  logLogout: vi.fn(),
  logLoginFailed: vi.fn(),
  logSignup: vi.fn(),
  logSignupFailed: vi.fn(),
  logPasswordResetRequest: vi.fn(),
  logPasswordResetComplete: vi.fn(),
}))

// Import after mocks are set up
import { AuthProvider, useAuth } from '@/lib/contexts/AuthContext'

// Test component that uses the auth context
function TestConsumer({
  onAuth,
}: {
  onAuth?: (auth: ReturnType<typeof useAuth>) => void
}) {
  const auth = useAuth()

  // Call the callback if provided
  if (onAuth) {
    onAuth(auth)
  }

  return (
    <div>
      <span data-testid="loading">{auth.loading ? 'loading' : 'ready'}</span>
      <span data-testid="user">{auth.user ? auth.user.email : 'no user'}</span>
    </div>
  )
}

// Helper to simulate auth state change
function simulateAuthStateChange(
  event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED',
  session: typeof mockSession | null
) {
  if (authStateChangeCallback) {
    authStateChangeCallback(event, session)
  }
}

// Helper functions to setup mock behaviors
function setupDefaultMocks() {
  mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
  mockOnAuthStateChange.mockImplementation((callback) => {
    authStateChangeCallback = callback
    return {
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    }
  })
  mockSignOut.mockResolvedValue({ error: null })
  // Default: account is not locked
  mockRpc.mockResolvedValue({ data: [], error: null })
}

function mockSuccessfulSignIn() {
  mockSignInWithPassword.mockResolvedValue({
    data: { user: mockUser, session: mockSession },
    error: null,
  })
}

function mockFailedSignIn(errorMessage: string) {
  mockSignInWithPassword.mockResolvedValue({
    data: { user: null, session: null },
    error: { message: errorMessage },
  })
}

function mockSuccessfulSignUp() {
  mockSignUp.mockResolvedValue({
    data: { user: mockUser, session: mockSession },
    error: null,
  })
}

function mockFailedSignUp(errorMessage: string) {
  mockSignUp.mockResolvedValue({
    data: { user: null, session: null },
    error: { message: errorMessage },
  })
}

function mockExistingSession() {
  mockGetSession.mockResolvedValue({
    data: { session: mockSession },
    error: null,
  })
}

function mockSuccessfulPasswordReset() {
  mockResetPasswordForEmail.mockResolvedValue({ error: null })
}

function mockFailedPasswordReset(errorMessage: string) {
  mockResetPasswordForEmail.mockResolvedValue({
    error: { message: errorMessage },
  })
}

function mockSuccessfulPasswordUpdate() {
  mockUpdateUser.mockResolvedValue({ data: { user: mockUser }, error: null })
}

function mockFailedPasswordUpdate(errorMessage: string) {
  mockUpdateUser.mockResolvedValue({
    data: { user: null },
    error: { message: errorMessage },
  })
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authStateChangeCallback = null
    setupDefaultMocks()
  })

  describe('initial state', () => {
    it('starts in loading state', () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    })

    it('checks for existing session on mount', async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(mockGetSession).toHaveBeenCalled()
      })
    })

    it('sets user when session exists', async () => {
      mockExistingSession()

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      })
    })

    it('sets loading to false after session check', async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })
    })

    it('subscribes to auth state changes', async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled()
      })
    })
  })

  describe('signIn', () => {
    it('calls supabase signInWithPassword', async () => {
      mockSuccessfulSignIn()
      let authRef: ReturnType<typeof useAuth> | null = null

      render(
        <AuthProvider>
          <TestConsumer
            onAuth={(auth) => {
              authRef = auth
            }}
          />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      await act(async () => {
        await authRef!.signIn('test@example.com', 'password123')
      })

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('returns empty object on success', async () => {
      mockSuccessfulSignIn()
      let authRef: ReturnType<typeof useAuth> | null = null

      render(
        <AuthProvider>
          <TestConsumer
            onAuth={(auth) => {
              authRef = auth
            }}
          />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      let result: { error?: string } = { error: 'initial' }
      await act(async () => {
        result = await authRef!.signIn('test@example.com', 'password123')
      })

      expect(result).toEqual({})
    })

    it('returns error message on failure', async () => {
      mockFailedSignIn('Invalid login credentials')
      let authRef: ReturnType<typeof useAuth> | null = null

      render(
        <AuthProvider>
          <TestConsumer
            onAuth={(auth) => {
              authRef = auth
            }}
          />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      let result: { error?: string } = {}
      await act(async () => {
        result = await authRef!.signIn('test@example.com', 'wrong-password')
      })

      expect(result.error).toBe('Invalid login credentials')
    })
  })

  describe('signUp', () => {
    it('calls supabase signUp', async () => {
      mockSuccessfulSignUp()
      let authRef: ReturnType<typeof useAuth> | null = null

      render(
        <AuthProvider>
          <TestConsumer
            onAuth={(auth) => {
              authRef = auth
            }}
          />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      await act(async () => {
        await authRef!.signUp('new@example.com', 'password123')
      })

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
      })
    })

    it('returns empty object on success', async () => {
      mockSuccessfulSignUp()
      let authRef: ReturnType<typeof useAuth> | null = null

      render(
        <AuthProvider>
          <TestConsumer
            onAuth={(auth) => {
              authRef = auth
            }}
          />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      let result: { error?: string } = { error: 'initial' }
      await act(async () => {
        result = await authRef!.signUp('new@example.com', 'password123')
      })

      expect(result).toEqual({})
    })

    it('returns error message on failure', async () => {
      mockFailedSignUp('User already registered')
      let authRef: ReturnType<typeof useAuth> | null = null

      render(
        <AuthProvider>
          <TestConsumer
            onAuth={(auth) => {
              authRef = auth
            }}
          />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      let result: { error?: string } = {}
      await act(async () => {
        result = await authRef!.signUp('existing@example.com', 'password123')
      })

      expect(result.error).toBe('User already registered')
    })
  })

  describe('signOut', () => {
    it('calls supabase signOut', async () => {
      mockExistingSession()
      let authRef: ReturnType<typeof useAuth> | null = null

      render(
        <AuthProvider>
          <TestConsumer
            onAuth={(auth) => {
              authRef = auth
            }}
          />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      })

      await act(async () => {
        await authRef!.signOut()
      })

      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  describe('resetPassword', () => {
    it('calls supabase resetPasswordForEmail', async () => {
      mockSuccessfulPasswordReset()
      let authRef: ReturnType<typeof useAuth> | null = null

      render(
        <AuthProvider>
          <TestConsumer
            onAuth={(auth) => {
              authRef = auth
            }}
          />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      await act(async () => {
        await authRef!.resetPassword('test@example.com')
      })

      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: expect.stringContaining('/reset-password/update'),
      })
    })

    it('returns empty object on success', async () => {
      mockSuccessfulPasswordReset()
      let authRef: ReturnType<typeof useAuth> | null = null

      render(
        <AuthProvider>
          <TestConsumer
            onAuth={(auth) => {
              authRef = auth
            }}
          />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      let result: { error?: string } = { error: 'initial' }
      await act(async () => {
        result = await authRef!.resetPassword('test@example.com')
      })

      expect(result).toEqual({})
    })

    it('returns error message on failure', async () => {
      mockFailedPasswordReset('Rate limit exceeded')
      let authRef: ReturnType<typeof useAuth> | null = null

      render(
        <AuthProvider>
          <TestConsumer
            onAuth={(auth) => {
              authRef = auth
            }}
          />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      let result: { error?: string } = {}
      await act(async () => {
        result = await authRef!.resetPassword('test@example.com')
      })

      expect(result.error).toBe('Rate limit exceeded')
    })
  })

  describe('updatePassword', () => {
    it('calls supabase updateUser', async () => {
      mockSuccessfulPasswordUpdate()
      mockExistingSession()
      let authRef: ReturnType<typeof useAuth> | null = null

      render(
        <AuthProvider>
          <TestConsumer
            onAuth={(auth) => {
              authRef = auth
            }}
          />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      })

      await act(async () => {
        await authRef!.updatePassword('newpassword123')
      })

      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newpassword123' })
    })

    it('returns empty object on success', async () => {
      mockSuccessfulPasswordUpdate()
      mockExistingSession()
      let authRef: ReturnType<typeof useAuth> | null = null

      render(
        <AuthProvider>
          <TestConsumer
            onAuth={(auth) => {
              authRef = auth
            }}
          />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      })

      let result: { error?: string } = { error: 'initial' }
      await act(async () => {
        result = await authRef!.updatePassword('newpassword123')
      })

      expect(result).toEqual({})
    })

    it('returns error message on failure', async () => {
      mockFailedPasswordUpdate('Password too weak')
      mockExistingSession()
      let authRef: ReturnType<typeof useAuth> | null = null

      render(
        <AuthProvider>
          <TestConsumer
            onAuth={(auth) => {
              authRef = auth
            }}
          />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      })

      let result: { error?: string } = {}
      await act(async () => {
        result = await authRef!.updatePassword('weak')
      })

      expect(result.error).toBe('Password too weak')
    })
  })

  describe('auth state changes', () => {
    it('updates user when auth state changes to signed in', async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      })

      expect(screen.getByTestId('user')).toHaveTextContent('no user')

      // Simulate sign in
      act(() => {
        simulateAuthStateChange('SIGNED_IN', mockSession)
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      })
    })

    it('clears user when auth state changes to signed out', async () => {
      mockExistingSession()

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      })

      // Simulate sign out
      act(() => {
        simulateAuthStateChange('SIGNED_OUT', null)
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no user')
      })
    })
  })

  describe('inactivity timeout', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('sets up inactivity timer when user is logged in', async () => {
      mockExistingSession()

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      // Wait for session to be checked - use runAllTimers to flush promises
      await act(async () => {
        await vi.runAllTimersAsync()
      })

      // Fast-forward 30 minutes (the timeout period)
      await act(async () => {
        vi.advanceTimersByTime(30 * 60 * 1000)
      })

      // Should have called signOut
      expect(mockSignOut).toHaveBeenCalled()
    })

    it('does not sign out before timeout', async () => {
      mockExistingSession()

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      // Wait for session to be checked
      await act(async () => {
        await vi.runAllTimersAsync()
      })

      // Clear any calls from session check
      mockSignOut.mockClear()

      // Fast-forward 29 minutes (before timeout)
      await act(async () => {
        vi.advanceTimersByTime(29 * 60 * 1000)
      })

      // Should not have called signOut yet
      expect(mockSignOut).not.toHaveBeenCalled()
    })
  })

  describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<TestConsumer />)
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleSpy.mockRestore()
    })
  })
})
