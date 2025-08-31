'use client';
import { Fragment, MouseEvent, useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { getOccurrences } from '@/lib/schedule';
import { endOfWeekISO, fmtDay, fmtTime, startOfWeekISO } from '@/lib/time';
import AppointmentForm from './AppointmentForm';

type Occ = {
  id: string;
  start: string;
  end: string;
  title?: string;
  clientId?: string;
  status?: 'pending' | 'done' | 'cancelled';
  price?: number;
};
type EditTarget = { baseId: string; start: string; end: string; title?: string };
type Props = { onChanged?: () => void };

const DAY_COLS = 7;
const SLOT_MIN = 15;
const START_HOUR = 9;
const END_HOUR = 24;

function slotISO(day: DateTime, hour: number, minute: number): string {
  return day
    .set({ hour, minute, second: 0, millisecond: 0 })
    .toISO({ suppressMilliseconds: true })!;
}
function nextQuarterISO(ref = DateTime.now()): string {
  const q = Math.ceil(ref.minute / 15) * 15;
  const hour = ref.hour + Math.floor(q / 60);
  const minute = q % 60;
  return ref
    .set({ hour, minute, second: 0, millisecond: 0 })
    .toISO({ suppressMilliseconds: true })!;
}

export default function WeekView({ onChanged }: Props) {
  const [ref, setRef] = useState(DateTime.now());
  const [items, setItems] = useState<Occ[]>([]);
  const [openFormAt, setOpenFormAt] = useState<string | undefined>();
  const [editing, setEditing] = useState<EditTarget | undefined>();
  const [scale, setScale] = useState(1);

  async function load() {
    const occs = await getOccurrences(startOfWeekISO(ref), endOfWeekISO(ref));
    setItems(
      occs
        .map((occ) => ({
          ...occ,
          status:
            occ.status === 'pending' || occ.status === 'done' || occ.status === 'cancelled'
              ? (occ.status as 'pending' | 'done' | 'cancelled')
              : undefined,
        }))
        .sort((a, b) => a.start.localeCompare(b.start))
    );
  }
  useEffect(() => { load(); }, [ref]);

  const days = useMemo(() => {
    const start = ref.startOf('week');
    return Array.from({ length: DAY_COLS }, (_, i) => start.plus({ days: i }));
  }, [ref]);

  const isThisWeek = ref.hasSame(DateTime.now(), 'week');

  const openEditor = (e: MouseEvent, data: EditTarget) => {
    e.stopPropagation();
    setEditing(data);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <nav
          aria-label="Navegación de semana"
          className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/70 p-0.5 shadow-sm backdrop-blur"
        >
          {(() => {
            const base =
              'px-3 py-1.5 rounded-full text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]';
            const ghost = 'hover:bg-accent/60 text-muted-foreground hover:text-foreground';
            const active = 'bg-primary text-primary-foreground shadow-glow';
            return (
              <>
                <button
                  aria-label="Semana anterior"
                  onClick={() => setRef(ref.minus({ weeks: 1 }))}
                  className={`${base} ${ghost} min-w-[96px] text-left`}
                  title="Semana anterior"
                >
                  ‹ Semana
                </button>

                <button
                  onClick={() => setRef(DateTime.now())}
                  title="Ir a hoy"
                  className={`${base} ${isThisWeek ? active : ghost} font-medium px-4 min-w-[72px] text-center`}
                >
                  Hoy
                </button>

                <button
                  aria-label="Semana siguiente"
                  onClick={() => setRef(ref.plus({ weeks: 1 }))}
                  className={`${base} ${ghost} min-w-[96px] text-right`}
                  title="Semana siguiente"
                >
                  Semana ›
                </button>
              </>
            );
          })()}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center rounded-full border border-border/60 bg-card/70 px-3 py-1 text-sm text-muted-foreground">
            {ref.startOf('week').setLocale('es').toFormat('dd LLL')} –{' '}
            {ref.endOf('week').setLocale('es').toFormat('dd LLL yyyy')}
          </span>

          <button
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 shadow-glow focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            onClick={() => setOpenFormAt(nextQuarterISO(ref))}
            title="Agregar turno"
          >
            <span className="text-base leading-none">＋</span> Agregar turno
          </button>

          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-2 py-1">
            <button
              onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
              className="rounded px-2 py-0.5 hover:bg-accent/50"
              title="Zoom -"
            >
              −
            </button>
            <span className="text-sm tabular-nums">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale((s) => Math.min(2, s + 0.1))}
              className="rounded px-2 py-0.5 hover:bg-accent/50"
              title="Zoom +"
            >
              ＋
            </button>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="card overflow-x-auto">
        <div
          className="origin-top-left"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left', minWidth: '960px' }}
        >
          <div className="grid isolate" style={{ gridTemplateColumns: `72px repeat(${DAY_COLS}, 1fr)` }}>
            {/* Encabezados */}
            <div className="h-10" />
            {days.map((d, i) => (
              <div
                key={i}
                className="h-10 px-2 flex items-end justify-center text-sm font-medium border-b border-border/60 text-foreground/90"
              >
                {fmtDay(d.toISO()!)}
              </div>
            ))}

            {/* Filas de la grilla */}
            {Array.from({ length: ((END_HOUR - START_HOUR) * 60) / SLOT_MIN }).map((_, row) => {
              const minute = (row * SLOT_MIN) % 60;
              const hour = Math.floor((row * SLOT_MIN) / 60) + START_HOUR;
              const label = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

              return (
                <Fragment key={`row-${row}`}>
                  {/* Col de horas */}
                  <div className="h-12 pr-2 text-xs text-right text-muted-foreground border-r border-border/60 flex items-center select-none">
                    {label}
                  </div>

                  {/* Celdas por día */}
                  {days.map((d, di) => {
                    const isTodayCol = d.hasSame(DateTime.now(), 'day');

                    const startsHere = items.some((i) => {
                      const s = DateTime.fromISO(i.start);
                      return s.hasSame(d, 'day') && s.hour === hour && s.minute === minute;
                    });

                    return (
                      <div
                        key={`${row}-${di}`}
                        className={`h-12 relative overflow-visible border border-l-0 border-t-0 border-border/60
                                    ${startsHere ? 'z-20' : 'z-0'}
                                    ${isTodayCol ? 'bg-primary/10' : 'bg-card/50'}`}
                        onClick={() => setOpenFormAt(slotISO(d, hour, minute))}
                        title="Click para nuevo turno"
                      >
                        {/* líneas finas de la grilla */}
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]" />

                        {/* Eventos que empiezan aquí */}
                        {items
                          .filter((i) => {
                            const s = DateTime.fromISO(i.start);
                            return s.hasSame(d, 'day') && s.hour === hour && s.minute === minute;
                          })
                          .map((i) => {
                            const start = DateTime.fromISO(i.start);
                            const end = DateTime.fromISO(i.end);
                            const mins = end.diff(start, 'minutes').minutes;
                            const rows = Math.max(1, Math.round(mins / SLOT_MIN));

                            let statusClasses = '';
                            if (i.status === 'done') {
                              statusClasses =
                                'border-green-400 bg-green-200/50 text-green-900 dark:border-green-600 dark:bg-green-900/40 dark:text-green-200';
                            } else if (i.status === 'cancelled') {
                              statusClasses =
                                'border-red-400 bg-red-200/50 text-red-900 dark:border-red-600 dark:bg-red-900/40 dark:text-red-200';
                            } else {
                              statusClasses =
                                'border-[hsl(var(--ring))] bg-[hsl(var(--ring))]/15 hover:bg-[hsl(var(--ring))]/20 text-foreground';
                            }

                            return (
                              <button
                                key={i.id}
                                onClick={(e) =>
                                  openEditor(e, {
                                    baseId: i.id.split('::')[0],
                                    start: i.start,
                                    end: i.end,
                                    title: i.title,
                                  })
                                }
                                className={`absolute inset-x-1 top-1 z-20 text-left rounded-xl px-2 py-1 text-xs shadow-glow border ${statusClasses}`}
                                style={{ height: `${rows * 3 - 0.5}rem` }}
                                title="Abrir turno"
                              >
                                <div className="font-medium truncate">{i.title ?? 'Turno'}</div>
                                <div className="opacity-80">{fmtTime(i.start)}–{fmtTime(i.end)}</div>
                              </button>
                            );
                          })}
                      </div>
                    );
                  })}
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Crear */}
      {openFormAt && (
        <AppointmentForm
          defaultStart={openFormAt}
          onClose={() => setOpenFormAt(undefined)}
          onSaved={() => {
            setOpenFormAt(undefined);
            load();
            onChanged?.();
          }}
        />
      )}

      {/* Editar */}
      {editing && (
        <AppointmentForm
          defaultStart={editing.start}
          editingBaseId={editing.baseId}
          occurrenceStartISO={editing.start}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            load();
            onChanged?.();
          }}
        />
      )}
    </div>
  );
}
