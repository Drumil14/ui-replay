import { NextResponse } from 'next/server';
import { listSessions, saveSession } from '@/lib/db';

export async function GET() {
  const sessions = await listSessions();
  return NextResponse.json({ sessions });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const events = Array.isArray(body.events) ? body.events : [];
  if (events.length === 0) {
    return NextResponse.json({ error: 'No events to save' }, { status: 400 });
  }

  const id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  const session = {
    id,
    createdAt: Date.now(),
    duration: Number(body.duration) || 0,
    width: Number(body.width) || 0,
    height: Number(body.height) || 0,
    events,
  };

  await saveSession(session);

  return NextResponse.json({
    session: {
      id: session.id,
      createdAt: session.createdAt,
      duration: session.duration,
      eventCount: events.length,
    },
  });
}

export const dynamic = 'force-dynamic';
