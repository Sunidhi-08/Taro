import { NextRequest, NextResponse } from 'next/server';
import { generateKitPipeline } from '@/lib/pipeline';
import { createKitForUser, getKitsForUser, getKitById, saveKit } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const kits = await getKitsForUser(user.id);
  return NextResponse.json({ kits });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const companyUrl = typeof body?.companyUrl === 'string' ? body.companyUrl.trim() : '';
  const jobDescription = typeof body?.jobDescription === 'string' ? body.jobDescription.trim() : '';
  const daysToInterview = Number(body?.daysToInterview ?? 1);

  if (!companyUrl || !jobDescription) {
    return NextResponse.json({ error: 'companyUrl and jobDescription are required.' }, { status: 400 });
  }

  const kitData = await generateKitPipeline({
    companyUrl,
    jobDescription,
    daysToInterview: Number.isFinite(daysToInterview) ? Math.min(60, Math.max(1, daysToInterview)) : 1,
  });

  const created = await createKitForUser(user.id, {
    companyUrl,
    jobDescription,
    daysToInterview: Number.isFinite(daysToInterview) ? Math.min(60, Math.max(1, daysToInterview)) : 1,
    status: kitData.status,
    companyBrief: kitData.companyBrief,
    requirements: kitData.requirements,
    questions: kitData.questions,
    flashcards: kitData.flashcards,
    schedule: kitData.schedule,
    editedFields: [],
    practiceScores: {},
  });

  return NextResponse.json({ kit: created });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const kitId = typeof body?.kitId === 'string' ? body.kitId : '';
  const updates = body?.updates ?? {};

  const kit = await getKitById(kitId);
  if (!kit || kit.userId !== user.id) {
    return NextResponse.json({ error: 'Kit not found.' }, { status: 404 });
  }

  const nextKit = { ...kit, ...updates, updatedAt: new Date().toISOString() };
  if (Array.isArray(updates.editedFields)) {
    nextKit.editedFields = Array.from(new Set([...kit.editedFields, ...updates.editedFields]));
  }

  await saveKit(nextKit);
  return NextResponse.json({ kit: nextKit });
}
