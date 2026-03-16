import { NextResponse } from 'next/server'

export async function GET() {
  // Simple health check endpoint for Cloud Run
  return NextResponse.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'gestify'
  })
}