import { vi } from 'vitest'

// Mock user data
export const mockUser = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {},
}

// Mock session data
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
}

// Create mock auth state change callback holder
let authStateChangeCallback: ((event: string, session: typeof mockSession | null) => void) | null =
  null

// Mock Supabase auth object
export const mockSupabaseAuth = {
  getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  onAuthStateChange: vi.fn().mockImplementation((callback) => {
    authStateChangeCallback = callback
    return {
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    }
  }),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
}

// Mock Supabase client
export const mockSupabase = {
  auth: mockSupabaseAuth,
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
}

// Helper to simulate auth state change
export function simulateAuthStateChange(
  event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED',
  session: typeof mockSession | null
) {
  if (authStateChangeCallback) {
    authStateChangeCallback(event, session)
  }
}

// Helper to reset all mocks
export function resetAllMocks() {
  mockSupabaseAuth.getSession.mockReset().mockResolvedValue({ data: { session: null }, error: null })
  mockSupabaseAuth.signInWithPassword.mockReset()
  mockSupabaseAuth.signUp.mockReset()
  mockSupabaseAuth.signOut.mockReset().mockResolvedValue({ error: null })
  mockSupabaseAuth.resetPasswordForEmail.mockReset()
  mockSupabaseAuth.updateUser.mockReset()
  authStateChangeCallback = null
}

// Helper to setup successful sign in
export function mockSuccessfulSignIn() {
  mockSupabaseAuth.signInWithPassword.mockResolvedValue({
    data: { user: mockUser, session: mockSession },
    error: null,
  })
}

// Helper to setup failed sign in
export function mockFailedSignIn(errorMessage: string) {
  mockSupabaseAuth.signInWithPassword.mockResolvedValue({
    data: { user: null, session: null },
    error: { message: errorMessage },
  })
}

// Helper to setup successful sign up
export function mockSuccessfulSignUp() {
  mockSupabaseAuth.signUp.mockResolvedValue({
    data: { user: mockUser, session: mockSession },
    error: null,
  })
}

// Helper to setup failed sign up
export function mockFailedSignUp(errorMessage: string) {
  mockSupabaseAuth.signUp.mockResolvedValue({
    data: { user: null, session: null },
    error: { message: errorMessage },
  })
}

// Helper to setup existing session
export function mockExistingSession() {
  mockSupabaseAuth.getSession.mockResolvedValue({
    data: { session: mockSession },
    error: null,
  })
}

// Helper to setup password reset success
export function mockSuccessfulPasswordReset() {
  mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({ error: null })
}

// Helper to setup password reset failure
export function mockFailedPasswordReset(errorMessage: string) {
  mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({
    error: { message: errorMessage },
  })
}

// Helper to setup password update success
export function mockSuccessfulPasswordUpdate() {
  mockSupabaseAuth.updateUser.mockResolvedValue({ data: { user: mockUser }, error: null })
}

// Helper to setup password update failure
export function mockFailedPasswordUpdate(errorMessage: string) {
  mockSupabaseAuth.updateUser.mockResolvedValue({
    data: { user: null },
    error: { message: errorMessage },
  })
}
