'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function KitBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const [kit, setKit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadKit() {
      const { id } = await params;
      const response = await fetch(`/api/kits/${id}`);
      const data = await response.json();
      setKit(data.kit || null);
      setLoading(false);
    }

    loadKit();
  }, [params]);

  if (loading) {
    return <main className="min-h-screen bg-slate-950 p-12 text-slate-100">Loading kit...</main>;
  }

  if (!kit) {
    return <main className="min-h-screen bg-slate-950 p-12 text-slate-100">Kit not found.</main>;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">Kit builder</p>
          <h1 className="mt-2 text-3xl font-bold">{kit.companyBrief.summary}</h1>
          <p className="mt-3 text-slate-300">{kit.companyBrief.whatTheyDo}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/practice/${kit.id}`} className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950">Practice questions</Link>
            <a href={kit.companyUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-700 px-4 py-2 text-sm">Open source URL</a>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Requirements</h2>
            <ul className="mt-4 space-y-3">
              {kit.requirements.map((item: any) => (
                <li key={item.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="mr-2 inline-flex rounded-full bg-cyan-500/15 px-2 py-0.5 text-xs text-cyan-300">{item.priority}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Questions</h2>
            <div className="mt-4 space-y-3">
              {kit.questions.map((question: any) => (
                <div key={question.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  {question.prompt}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{kit.daysToInterview}-day study plan</h2>
              <p className="mt-1 text-sm text-slate-400">Select a day to focus your preparation.</p>
            </div>
            <Link href={`/practice/${kit.id}`} className="text-sm font-semibold text-cyan-400">Start practice</Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {kit.schedule.map((day: any) => (
              <div id={`day-${day.day}`} key={day.day} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-cyan-300">Day {day.day}</p>
                  <span className="text-xs text-slate-500">{day.questions.length} questions</span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{day.focus}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
