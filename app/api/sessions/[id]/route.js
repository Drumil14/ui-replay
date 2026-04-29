import { NextResponse } from 'next/server';
import { getSession, deleteSession } from '@/lib/db';

export async function GET(_request, { params }) {
  const session = await getSession(params.id);
  if (!session) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ session });
}

export async function DELETE(_request, { params }) {
  const ok = await deleteSession(params.id);
  if (!ok) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export const dynamic = 'force-dynamic';
