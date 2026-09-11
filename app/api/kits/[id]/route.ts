import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getKitById, saveKit } from '@/lib/store';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const kit = await getKitById(id);
  if (!kit || kit.userId !== user.id) {
    return NextResponse.json({ error: 'Kit not found.' }, { status: 404 });
  }

  return NextResponse.json({ kit });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const kit = await getKitById(id);
  if (!kit || kit.userId !== user.id) {
    return NextResponse.json({ error: 'Kit not found.' }, { status: 404 });
  }

  const body = await request.json();
  const nextKit = { ...kit, ...body, updatedAt: new Date().toISOString() };
  await saveKit(nextKit);
  return NextResponse.json({ kit: nextKit });
}
