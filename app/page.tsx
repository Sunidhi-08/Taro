import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.24em] text-cyan-400">Taro</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Build your interview kit in minutes</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Generate a tailored prep plan from a company URL and job description, then track your progress in your own dashboard.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/register" className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
              Create account
            </Link>
            <Link href="/login" className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-100 transition hover:border-cyan-500 hover:text-cyan-300">
              Log in
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            ['Requirements', 'Extract must-have skills and nice-to-haves from the job description.'],
            ['Coverage', 'Ensure every critical requirement has at least one interview question.'],
            ['Schedule', 'Map questions across the days remaining before your interview.'],
          ].map(([title, description]) => (
            <div key={title} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">{title}</p>
              <p className="mt-3 text-slate-300">{description}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
