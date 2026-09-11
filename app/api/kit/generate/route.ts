import { NextRequest, NextResponse } from 'next/server';
import { generateKitPipeline } from '@/lib/pipeline';

async function fetchCompanyHtml(companyUrl: string): Promise<string | undefined> {
  try {
    const parsed = new URL(companyUrl);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return undefined;
    }

    const response = await fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'TaroInterviewBot/1.0',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return undefined;
    }

    return await response.text();
  } catch {
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyUrl = typeof body?.companyUrl === 'string' ? body.companyUrl.trim() : '';
    const jobDescription = typeof body?.jobDescription === 'string' ? body.jobDescription.trim() : '';
    const daysToInterview = Number(body?.daysToInterview ?? 1);

    if (!companyUrl || !jobDescription) {
      return NextResponse.json(
        { error: 'companyUrl and jobDescription are required.' },
        { status: 400 },
      );
    }

    const companyHtml = await fetchCompanyHtml(companyUrl);
    const kit = await generateKitPipeline({
      companyUrl,
      jobDescription,
      daysToInterview: Number.isFinite(daysToInterview) ? Math.min(60, Math.max(1, daysToInterview)) : 1,
    });

    return NextResponse.json(kit);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
