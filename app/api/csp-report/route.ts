import { NextRequest, NextResponse } from 'next/server'

/**
 * CSP Violation Reporting Endpoint
 *
 * Receives Content Security Policy violation reports from browsers.
 * Logs violations in development, can be extended to send to monitoring service in production.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // In development, log the violation
    if (process.env.NODE_ENV === 'development') {
      console.log('🚨 CSP Violation Report:', JSON.stringify(body, null, 2))
    }

    // In production, you could send to a monitoring service:
    // - Sentry
    // - LogRocket
    // - Custom logging service
    // Example:
    // if (process.env.NODE_ENV === 'production') {
    //   await sendToMonitoringService(body)
    // }

    // Extract useful violation details
    const cspReport = body['csp-report'] || body
    const violation = {
      blockedUri: cspReport['blocked-uri'] || cspReport.blockedURL,
      violatedDirective: cspReport['violated-directive'] || cspReport.effectiveDirective,
      originalPolicy: cspReport['original-policy'],
      documentUri: cspReport['document-uri'] || cspReport.documentURL,
      sourceFile: cspReport['source-file'],
      lineNumber: cspReport['line-number'],
      columnNumber: cspReport['column-number'],
      timestamp: new Date().toISOString(),
    }

    // Log clean violation summary
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 CSP Violation Summary:')
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
    console.error('Error processing CSP report:', error)
    // Still return 204 to prevent browser retries
    return new NextResponse(null, { status: 204 })
  }
}

// Prevent caching of this endpoint
export const dynamic = 'force-dynamic'
