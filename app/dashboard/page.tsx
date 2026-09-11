'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

type User = { id: string; email: string } | null;
type Kit = {
  id: string;
  companyUrl: string;
  jobDescription: string;
  daysToInterview: number;
  companyBrief: { summary: string; whatTheyDo: string; note?: string };
  requirements: Array<{ id: string; text: string; priority: string; kind: string }>;
  questions: Array<{ id: string; prompt: string; requirementIds: string[]; difficulty: number; priority: string }>;
  schedule: Array<{ day: number; focus: string; questions: Array<{ id: string }> }>;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User>(null);
  const [kits, setKits] = useState<Kit[]>([]);
  const [form, setForm] = useState({ email: 'demo@taro.app', password: 'demo123' });
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [kitForm, setKitForm] = useState({
    companyUrl: '',
    jobDescription: '',
    daysToInterview: 7,
  });

  async function loadUser() {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    setUser(data.user);
    if (data.user) {
      const kitsResponse = await fetch('/api/kits');
      const kitsData = await kitsResponse.json();
      setKits(kitsData.kits ?? []);
    }
  }

  useEffect(() => { loadUser(); }, []);

  async function submitAuth() {
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Authentication failed');
      return;
    }

    setError('');
    await loadUser();
  }

  async function createKit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError('');

    const response = await fetch('/api/kits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kitForm),
    });

    const data = await response.json();
    setCreating(false);
    if (!response.ok) {
      setError(data.error || 'Unable to create kit.');
      return;
    }

    setKits((current) => [data.kit, ...current]);
    setKitForm({ companyUrl: '', jobDescription: '', daysToInterview: 7 });
    setShowCreateForm(false);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setKits([]);
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-3xl font-bold">Welcome to Taro</h1>
          <p className="mt-2 text-slate-400">Log in to manage your interview kits.</p>

          <div className="mt-6 flex gap-2 rounded-xl bg-slate-800 p-1">
            <button onClick={() => setMode('login')} className={`flex-1 rounded-lg px-3 py-2 ${mode === 'login' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'}`}>
              Login
            </button>
            <button onClick={() => setMode('register')} className={`flex-1 rounded-lg px-3 py-2 ${mode === 'register' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'}`}>
              Register
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block text-sm text-slate-300">
              Email
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
            </label>
            <label className="block text-sm text-slate-300">
              Password
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
            </label>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <button onClick={submitAuth} className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">
              {mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">{user.email}</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCreateForm(true)} className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950">+ Add interview kit</button>
            <button onClick={logout} className="rounded-xl border border-slate-700 px-4 py-2">Logout</button>
          </div>
        </header>

        {showCreateForm ? (
          <section className="rounded-3xl border border-cyan-500/30 bg-slate-900 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">New preparation plan</p>
                <h2 className="mt-2 text-2xl font-bold">Build a kit from a real job</h2>
                <p className="mt-2 text-sm text-slate-400">Add the job posting details and choose how many days you have to prepare.</p>
              </div>
              <button type="button" onClick={() => setShowCreateForm(false)} className="text-sm text-slate-400 hover:text-white">Cancel</button>
            </div>

            <form onSubmit={createKit} className="mt-6 grid gap-5">
              <label className="block text-sm text-slate-300">
                Company or job posting URL
                <input required type="url" placeholder="https://company.com/careers" value={kitForm.companyUrl} onChange={(e) => setKitForm({ ...kitForm, companyUrl: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-cyan-400" />
              </label>
              <label className="block text-sm text-slate-300">
                Job description
                <textarea required minLength={20} rows={6} placeholder="Paste the responsibilities, requirements, and qualifications here..." value={kitForm.jobDescription} onChange={(e) => setKitForm({ ...kitForm, jobDescription: e.target.value })} className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-cyan-400" />
              </label>
              <fieldset>
                <legend className="text-sm text-slate-300">Days until interview</legend>
                <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {[1, 3, 5, 7, 14, 21, 30].map((days) => (
                    <button key={days} type="button" onClick={() => setKitForm({ ...kitForm, daysToInterview: days })} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${kitForm.daysToInterview === days ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-cyan-400'}`}>
                      {days} {days === 1 ? 'day' : 'days'}
                    </button>
                  ))}
                </div>
              </fieldset>
              {error ? <p className="text-sm text-red-300">{error}</p> : null}
              <button disabled={creating} className="rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60">
                {creating ? 'Generating your kit...' : 'Create interview kit'}
              </button>
            </form>
          </section>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {kits.length === 0 ? (
            <section className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-8 md:col-span-2 xl:col-span-3">
              <h2 className="text-xl font-semibold">Your preparation workspace is empty</h2>
              <p className="mt-2 text-slate-400">Create your first kit to turn a job description into questions, flashcards, and a daily plan.</p>
              <button onClick={() => setShowCreateForm(true)} className="mt-5 rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950">Create your first kit</button>
            </section>
          ) : null}
          {kits.map((kit) => (
            <article key={kit.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-cyan-400">{kit.companyUrl}</p>
              <h2 className="mt-2 text-xl font-semibold">{kit.companyBrief.summary}</h2>
              <p className="mt-3 text-sm text-slate-300">{kit.requirements.length} requirements • {kit.questions.length} questions</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {kit.schedule.slice(0, 7).map((day) => (
                  <Link key={day.day} href={`/kit/${kit.id}#day-${day.day}`} className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-cyan-500 hover:text-slate-950">Day {day.day}</Link>
                ))}
              </div>

              <div className="mt-5 flex gap-2">
                <Link href={`/kit/${kit.id}`} className="flex-1 rounded-xl bg-cyan-500 px-3 py-2 text-center text-sm font-semibold text-slate-950">Open builder</Link>
                <Link href={`/practice/${kit.id}`} className="flex-1 rounded-xl border border-slate-700 px-3 py-2 text-center text-sm font-medium text-slate-100">Practice</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
