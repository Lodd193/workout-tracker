import { supabase } from '@/lib/supabase'

/**
 * Security event types that can be reported
 */
export type SecurityEventType =
  | 'csp_violation'
  | 'auth_failure'
  | 'rate_limit_exceeded'
  | 'suspicious_activity'
  | 'invalid_input'

/**
 * Security event severity levels
 */
export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical'

/**
 * Security event interface
 */
export interface SecurityEvent {
  type: SecurityEventType
  severity: SecuritySeverity
  details: Record<string, unknown>
  userId?: string
  ipAddress?: string
  userAgent?: string
}

/**
 * CSP Violation details
 */
export interface CSPViolationDetails {
  blockedUri: string
  violatedDirective: string
  originalPolicy?: string
  documentUri: string
  sourceFile?: string
  lineNumber?: number
  columnNumber?: number
}

/**
 * Report a security event to the audit system
 *
 * In production, this could also send to external monitoring services
 * like Sentry, LogRocket, or a SIEM system.
 */
export async function reportSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    const { type, severity, details, userId, ipAddress, userAgent } = event

    // Log to audit_logs table as a security event
    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId || null,
      action: `security_${type}`,
      resource: 'security',
      resource_id: null,
      metadata: {
        severity,
        ...details,
        reported_at: new Date().toISOString(),
      },
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    })

    if (error) {
      // Don't throw - security logging should not break the app
      console.error('[SecurityMonitor] Failed to log event:', error.message)
    }

    // In development, also log to console for visibility
    if (process.env.NODE_ENV === 'development') {
      const severityEmoji = {
        low: '📝',
        medium: '⚠️',
        high: '🚨',
        critical: '🔴',
      }
      console.log(`${severityEmoji[severity]} [Security] ${type}:`, details)
    }

    // In production, you could send to external services:
    // if (process.env.NODE_ENV === 'production') {
    //   await sendToSentry(event)
    //   await sendToLogRocket(event)
    // }
  } catch (err) {
    // Silently fail - security logging should not break the app
    console.error('[SecurityMonitor] Error reporting event:', err)
  }
}

/**
 * Report a CSP violation
 */
export async function reportCSPViolation(
  violation: CSPViolationDetails,
  options?: {
    ipAddress?: string
    userAgent?: string
  }
): Promise<void> {
  // Determine severity based on the violation type
  const severity = determineCSPSeverity(violation)

  await reportSecurityEvent({
    type: 'csp_violation',
    severity,
    details: {
      blocked_uri: violation.blockedUri,
      violated_directive: violation.violatedDirective,
      original_policy: violation.originalPolicy,
      document_uri: violation.documentUri,
      source_file: violation.sourceFile,
      line_number: violation.lineNumber,
      column_number: violation.columnNumber,
    },
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
  })
}

/**
 * Report a failed authentication attempt
 */
export async function reportAuthFailure(
  email: string,
  reason: string,
  options?: {
    ipAddress?: string
    userAgent?: string
    attempts?: number
  }
): Promise<void> {
  // Higher severity if there are multiple attempts
  const severity: SecuritySeverity =
    options?.attempts && options.attempts >= 5 ? 'high' : 'medium'

  await reportSecurityEvent({
    type: 'auth_failure',
    severity,
    details: {
      email,
      reason,
      attempts: options?.attempts,
    },
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
  })
}

/**
 * Report a rate limit violation
 */
export async function reportRateLimitExceeded(
  endpoint: string,
  options?: {
    userId?: string
    ipAddress?: string
    limit?: number
    windowMs?: number
  }
): Promise<void> {
  await reportSecurityEvent({
    type: 'rate_limit_exceeded',
    severity: 'medium',
    details: {
      endpoint,
      limit: options?.limit,
      window_ms: options?.windowMs,
    },
    userId: options?.userId,
    ipAddress: options?.ipAddress,
  })
}

/**
 * Report suspicious activity
 */
export async function reportSuspiciousActivity(
  activity: string,
  details: Record<string, unknown>,
  options?: {
    userId?: string
    ipAddress?: string
    userAgent?: string
    severity?: SecuritySeverity
  }
): Promise<void> {
  await reportSecurityEvent({
    type: 'suspicious_activity',
    severity: options?.severity || 'high',
    details: {
      activity,
      ...details,
    },
    userId: options?.userId,
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
  })
}

/**
 * Report invalid input that might indicate an attack
 */
export async function reportInvalidInput(
  field: string,
  value: string,
  reason: string,
  options?: {
    userId?: string
    ipAddress?: string
  }
): Promise<void> {
  // Truncate long values to prevent log bloat
  const truncatedValue = value.length > 100 ? `${value.slice(0, 100)}...` : value

  await reportSecurityEvent({
    type: 'invalid_input',
    severity: 'low',
    details: {
      field,
      value: truncatedValue,
      reason,
    },
    userId: options?.userId,
    ipAddress: options?.ipAddress,
  })
}

/**
 * Determine the severity of a CSP violation based on its characteristics
 */
function determineCSPSeverity(violation: CSPViolationDetails): SecuritySeverity {
  const directive = violation.violatedDirective?.toLowerCase() || ''
  const blockedUri = violation.blockedUri?.toLowerCase() || ''

  // Critical: script execution attempts
  if (directive.includes('script-src') || directive.includes('unsafe-inline')) {
    return 'high'
  }

  // High: external resource loading
  if (blockedUri.includes('://') && !blockedUri.includes('data:')) {
    return 'medium'
  }

  // Medium: data URIs or inline styles
  if (directive.includes('style-src') || blockedUri.startsWith('data:')) {
    return 'low'
  }

  // Default: low severity for other violations
  return 'low'
}

/**
 * Get security event statistics (for admin dashboard)
 */
export async function getSecurityStats(
  startDate: Date,
  endDate: Date
): Promise<{
  totalEvents: number
  byType: Record<string, number>
  bySeverity: Record<string, number>
} | null> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('action, metadata')
      .eq('resource', 'security')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (error) {
      console.error('[SecurityMonitor] Failed to get stats:', error.message)
      return null
    }

    const stats = {
      totalEvents: data.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
    }

    for (const row of data) {
      // Count by type
      const type = row.action?.replace('security_', '') || 'unknown'
      stats.byType[type] = (stats.byType[type] || 0) + 1

      // Count by severity
      const metadata = row.metadata as Record<string, unknown> | null
      const severity = (metadata?.severity as string) || 'unknown'
      stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1
    }

    return stats
  } catch (err) {
    console.error('[SecurityMonitor] Error getting stats:', err)
    return null
  }
}
