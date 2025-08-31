'use client';
import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { getOccurrences } from '@/lib/schedule';

export default function StatsBar({ refreshKey = 0 }: { refreshKey?: number }) {
  const [today, setToday] = useState(0);
  const [week, setWeek] = useState(0);
  const [month, setMonth] = useState(0);

  useEffect(() => {
    (async () => {
      const now = DateTime.now();
      const t = await getOccurrences(now.startOf('day').toISO()!, now.endOf('day').toISO()!);
      const w = await getOccurrences(now.startOf('week').toISO()!, now.endOf('week').toISO()!);
      const m = await getOccurrences(now.startOf('month').toISO()!, now.endOf('month').toISO()!);
      setToday(t.length); setWeek(w.length); setMonth(m.length);
    })();
  }, [refreshKey]);

  const StatCard = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: number;
    icon: React.ReactNode;
  }) => (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-neutral-900/70 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
          {icon}
        </span>
      </div>
      <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <StatCard
        label="Turnos hoy"
        value={today}
        icon={
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path d="M7 2v3M17 2v3M3 8h18M4 6h16a1 1 0 011 1v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 011-1z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        }
      />
      <StatCard
        label="Turnos esta semana"
        value={week}
        icon={
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path d="M4 5h16M4 10h16M4 15h10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        }
      />
      <StatCard
        label="Turnos este mes"
        value={month}
        icon =
        {
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path d="M7 3v3m10-3v3M4 8h16M5 6h14a1 1 0 011 1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a1 1 0 011-1z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        }
      />
    </div>
  );
}
