'use client';

import { useEffect, useState } from 'react';

export default function PracticePage({ params }: { params: Promise<{ id: string }> }) {
  const [kit, setKit] = useState<any>(null);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadKit() {
      const { id } = await params;
      const response = await fetch(`/api/kits/${id}`);
      const data = await response.json();
      setKit(data.kit || null);
      if (data.kit?.practiceScores) {
        setScores(data.kit.practiceScores);
      }
    }

    loadKit();
  }, [params]);

  if (!kit) {
    return <main className="min-h-screen bg-slate-950 p-12 text-slate-100">Loading practice cards...</main>;
  }

  const cards = kit.flashcards || [];
  const current = cards[index];

  async function rateCard(score: number) {
    if (!current) return;
    const nextScores = { ...scores, [current.id]: score };
    setScores(nextScores);
    setShowAnswer(false);

    await fetch(`/api/kits/${kit.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ practiceScores: nextScores }),
    });

    setIndex((previous) => (previous + 1) % cards.length);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">Practice mode</p>
        <h1 className="mt-2 text-3xl font-bold">Flashcard review</h1>

        {current ? (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <p className="text-sm uppercase text-slate-400">Front</p>
              <p className="mt-3 text-xl">{current.front}</p>
            </div>

            {showAnswer ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
                <p className="text-sm uppercase text-slate-400">Back</p>
                <p className="mt-3 text-lg text-slate-200">{current.back}</p>
              </div>
            ) : null}

            <div className="flex gap-3">
              <button onClick={() => setShowAnswer(true)} className="flex-1 rounded-xl border border-slate-700 px-4 py-3 font-medium">
                Show answer
              </button>
            </div>

            {showAnswer ? (
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button key={score} onClick={() => rateCard(score)} className="rounded-xl bg-cyan-500 px-3 py-3 font-semibold text-slate-950">
                    {score}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-8 text-slate-400">No flashcards available for this kit yet.</p>
        )}
      </div>
    </main>
  );
}
