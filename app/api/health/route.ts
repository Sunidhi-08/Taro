import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase, isMongoConfigured } from '@/lib/mongo';

export async function GET() {
  if (!isMongoConfigured()) {
    return NextResponse.json({
      status: 'ok',
      database: 'not-configured',
      environment: process.env.NODE_ENV || 'development',
    });
  }

  await connectToDatabase();
  const connected = mongoose.connection.readyState === 1;

  return NextResponse.json({
    status: connected ? 'ok' : 'degraded',
    database: connected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
  }, { status: connected ? 200 : 503 });
}
