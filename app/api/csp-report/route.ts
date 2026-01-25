import { NextRequest, NextResponse } from 'next/server'
import { reportCSPViolation, type CSPViolationDetails } from '@/lib/security/monitor'

/**
 * CSP Violation Reporting Endpoint
 *
 * Receives Content Security Policy violation reports from browsers.
 * Logs violations to the security monitoring system.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract useful violation details from the report
    const cspReport = body['csp-report'] || body
    const violation: CSPViolationDetails = {
      blockedUri: cspReport['blocked-uri'] || cspReport.blockedURL || 'unknown',
      violatedDirective:
        cspReport['violated-directive'] || cspReport.effectiveDirective || 'unknown',
      originalPolicy: cspReport['original-policy'],
      documentUri: cspReport['document-uri'] || cspReport.documentURL || 'unknown',
      sourceFile: cspReport['source-file'],
      lineNumber: cspReport['line-number'],
      columnNumber: cspReport['column-number'],
    }

    // Get request metadata
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || undefined

    // Report to security monitoring system
    await reportCSPViolation(violation, {
      ipAddress,
      userAgent,
    })

    // In development, also log to console for immediate visibility
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 CSP Violation:')
      console.log(`  Blocked: ${violation.blockedUri}`)
      console.log(`  Violated: ${violation.violatedDirective}`)
      console.log(`  Page: ${violation.documentUri}`)
      if (violation.sourceFile) {
        console.log(`  Source: ${violation.sourceFile}:${violation.lineNumber}`)
      }
    }

    // Return 204 No Content (standard response for reporting endpoints)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    // Log the error but still return 204 to prevent browser retries
    console.error('Error processing CSP report:', error)
    return new NextResponse(null, { status: 204 })
  }
}

// Prevent caching of this endpoint
export const dynamic = 'force-dynamic'
