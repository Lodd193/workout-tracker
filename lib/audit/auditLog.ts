import { supabase } from '@/lib/supabase'

export type AuditAction =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'signup'
  | 'signup_failed'
  | 'password_reset_request'
  | 'password_reset_complete'

export type AuditResource = 'auth' | 'workout' | 'template' | 'goal' | 'settings'

export interface AuditLogEntry {
  action: AuditAction
  resource: AuditResource
  resourceId?: string
  metadata?: Record<string, unknown>
  userId?: string
}

/**
 * Log an audit event to the audit_logs table
 * This is used to track security-relevant actions like login/logout
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const { action, resource, resourceId, metadata, userId } = entry

    // Get browser info for context (client-side only)
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined

    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId || null,
      action,
      resource,
      resource_id: resourceId || null,
      metadata: metadata || {},
      user_agent: userAgent,
      // IP address would need to be captured server-side
      ip_address: null,
    })

    if (error) {
      // Don't throw - audit logging should not break the app
      console.error('[AuditLog] Failed to log event:', error.message)
    }
  } catch (err) {
    // Silently fail - audit logging should not break the app
    console.error('[AuditLog] Error logging event:', err)
  }
}

/**
 * Log a successful login
 */
export async function logLogin(userId: string, email?: string): Promise<void> {
  await logAuditEvent({
    action: 'login',
    resource: 'auth',
    userId,
    metadata: email ? { email } : undefined,
  })
}

/**
 * Log a successful logout
 */
export async function logLogout(userId: string): Promise<void> {
  await logAuditEvent({
    action: 'logout',
    resource: 'auth',
    userId,
  })
}

/**
 * Log a failed login attempt
 */
export async function logLoginFailed(email: string, reason?: string): Promise<void> {
  await logAuditEvent({
    action: 'login_failed',
    resource: 'auth',
    metadata: {
      email,
      reason: reason || 'invalid_credentials',
    },
  })
}

/**
 * Log a successful signup
 */
export async function logSignup(userId: string, email: string): Promise<void> {
  await logAuditEvent({
    action: 'signup',
    resource: 'auth',
    userId,
    metadata: { email },
  })
}

/**
 * Log a failed signup attempt
 */
export async function logSignupFailed(email: string, reason: string): Promise<void> {
  await logAuditEvent({
    action: 'signup_failed',
    resource: 'auth',
    metadata: { email, reason },
  })
}

/**
 * Log a password reset request
 */
export async function logPasswordResetRequest(email: string): Promise<void> {
  await logAuditEvent({
    action: 'password_reset_request',
    resource: 'auth',
    metadata: { email },
  })
}

/**
 * Log a successful password reset
 */
export async function logPasswordResetComplete(userId: string): Promise<void> {
  await logAuditEvent({
    action: 'password_reset_complete',
    resource: 'auth',
    userId,
  })
}
