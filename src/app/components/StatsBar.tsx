'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { getOccurrences } from '@/lib/schedule';
import { motion } from 'framer-motion';

/** ISO “local” sin offset ni milisegundos — evita que se corra a ayer/mañana por zona horaria */
const toLocalISO = (d: DateTime) =>
  d.setZone('local').toISO({ suppressMilliseconds: true, includeOffset: false })!;

function useCountUp(target: number, deps: unknown[] = [], ms = 450) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const from = val;
    const to = target;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return val;
}

export default function StatsBar({ refreshKey = 0 }: { refreshKey?: number }) {
  const [raw, setRaw] = useState({ today: 0, week: 0, month: 0 });

  useEffect(() => {
    (async () => {
      const now = DateTime.local();

      const t = await getOccurrences(
        toLocalISO(now.startOf('day')),
        toLocalISO(now.endOf('day')),
      );

      const w = await getOccurrences(
        toLocalISO(now.startOf('week')),
        toLocalISO(now.endOf('week')),
      );

      const m = await getOccurrences(
        toLocalISO(now.startOf('month')),
        toLocalISO(now.endOf('month')),
      );

      setRaw({ today: t.length, week: w.length, month: m.length });
    })();
  }, [refreshKey]);

  const today = useCountUp(raw.today, [raw.today]);
  const week = useCountUp(raw.week, [raw.week]);
  const month = useCountUp(raw.month, [raw.month]);

  const StatCard = ({
    label,
    value,
    icon,
    d = 0,
  }: {
    label: string; value: number; icon: React.ReactNode; d?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, delay: d }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-neutral-900/70 p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
          {icon}
        </span>
      </div>
      <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
    </motion.div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 stats-appear">
      <StatCard
        label="Turnos hoy"
        value={today}
        d={0.0}
        icon={
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path d="M7 2v3M17 2v3M3 8h18M4 6h16a1 1 0 011 1v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 011-1z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
        }
      />
      <StatCard
        label="Turnos esta semana"
        value={week}
        d={0.05}
        icon={
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path d="M4 5h16M4 10h16M4 15h10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
        }
      />
      <StatCard
        label="Turnos este mes"
        value={month}
        d={0.1}
        icon={
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path d="M7 3v3m10-3v3M4 8h16M5 6h14a1 1 0 011 1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a1 1 0 011-1z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
        }
      />
    </div>
  );
}
