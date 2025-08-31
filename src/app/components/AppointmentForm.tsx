'use client';
import { useEffect, useState } from 'react';
import { db, Appointment, Service } from '@/lib/db';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';
import { isSlotAvailable } from '@/lib/schedule';

type Props = {
  defaultStart?: string;
  editingBaseId?: string;
  occurrenceStartISO?: string;
  onClose: () => void;
  onSaved: () => void;
};

export default function AppointmentForm({
  defaultStart,
  editingBaseId,
  occurrenceStartISO,
  onClose,
  onSaved,
}: Props) {
  const [title, setTitle] = useState('');
  const [durationMin, setDurationMin] = useState(30);
  const [startISO, setStartISO] = useState(defaultStart ?? DateTime.now().toISO()!);
  const [isRecurring, setIsRecurring] = useState(false);
  const [freq, setFreq] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [interval, setInterval] = useState(1);
  const [byweekday, setByweekday] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string>('');

  /* clases reutilizables */
  const inputCls = "input mt-1";
  const chipBase = "px-3 py-1 rounded-full border text-sm transition-colors select-none";
  const chipActive = "bg-primary text-primary-foreground border-primary hover:opacity-90";
  const chipInactive = "bg-transparent text-foreground/80 border-border hover:bg-accent";

  const days = [
    { label: 'L', value: 0 }, { label: 'M', value: 1 }, { label: 'X', value: 2 },
    { label: 'J', value: 3 }, { label: 'V', value: 4 }, { label: 'S', value: 5 }, { label: 'D', value: 6 },
  ];

  useEffect(() => {
    if (!editingBaseId) return;
    (async () => {
      const base = await db.appointments.get(editingBaseId);
      if (!base) return;
      setTitle(base.title ?? '');
      setDurationMin(base.durationMin);
      setIsRecurring(base.isRecurring);
      if (base.isRecurring && base.rrule) {
        setFreq(base.rrule.freq);
        setInterval(base.rrule.interval ?? 1);
        setByweekday(base.rrule.byweekday ?? []);
      }
      setStartISO(occurrenceStartISO ?? base.startDateTime);
      setServiceId(base.serviceId ?? '');
    })();
  }, [editingBaseId, occurrenceStartISO]);

  useEffect(() => {
    (async () => {
      const all = await db.services.toArray();
      setServices(all);
    })();
  }, []);

  useEffect(() => {
    if (!editingBaseId && isRecurring && freq === 'WEEKLY') setByweekday([]);
  }, [startISO, isRecurring, freq, editingBaseId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!serviceId) { setError('Tenés que seleccionar un servicio.'); return; }
    if (isRecurring && freq === 'WEEKLY' && byweekday.length === 0) {
      setError('Tenés que seleccionar al menos un día de la semana.'); return;
    }

    const free = await isSlotAvailable(startISO, durationMin, editingBaseId);
    if (!free) { setError('Ese horario ya está ocupado por otro turno.'); return; }

    const payload: Appointment = {
      id: editingBaseId ?? nanoid(),
      title: title || 'Turno',
      startDateTime: startISO,
      durationMin,
      isRecurring,
      rrule: isRecurring ? { freq, interval, byweekday } : undefined,
      serviceId,
    };

    await db.appointments.put(payload);
    onSaved();
  }

  async function confirmDelete(choice: 'uno' | 'todos' | 'actual') {
    if (!editingBaseId) return;
    const base = await db.appointments.get(editingBaseId);
    if (!base) return;

    if (base.isRecurring) {
      if (choice === 'uno' && occurrenceStartISO) {
        await db.exceptions.add({ id: nanoid(), appointmentId: base.id, originalDateTime: occurrenceStartISO, type: 'skip' });
      } else if (choice === 'todos') {
        await db.appointments.delete(base.id);
      } else if (choice === 'actual' && occurrenceStartISO) {
        await db.appointments.put({ ...base, id: nanoid(), startDateTime: occurrenceStartISO, isRecurring: false, rrule: undefined });
        await db.appointments.delete(base.id);
      }
    } else {
      await db.appointments.delete(base.id);
    }
    setShowDeleteModal(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-[min(92vw,40rem)] overflow-hidden rounded-2xl border border-border/60
                   bg-card/95 backdrop-blur-md shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-border/60">
          <h2 className="text-lg font-semibold text-foreground">{editingBaseId ? 'Editar turno' : 'Nuevo turno'}</h2>
          {editingBaseId && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="btn-ghost px-3 py-1.5 text-sm"
              title="Eliminar o cancelar"
            >
              Eliminar/Cancelar
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {error && (
            <p className="rounded-md border border-red-400/60 bg-red-50 text-red-700
                          dark:border-red-700 dark:bg-red-900/20 dark:text-red-200
                          px-3 py-2 text-sm">
              {error}
            </p>
          )}

          <label className="block">
            <span className="text-sm font-medium text-foreground/90">Título/Cliente</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
              placeholder="Juan / Corte 30m"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground/90">Servicio</span>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className={inputCls}
            >
              <option value="">Seleccioná un servicio...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id} className="text-black">
                  {s.name} — {s.price}$
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-foreground/90">Inicio</span>
              <input
                type="datetime-local"
                value={DateTime.fromISO(startISO).toFormat("yyyy-LL-dd'T'HH:mm")}
                onChange={(e) =>
                  setStartISO(
                    DateTime.fromFormat(e.target.value, "yyyy-LL-dd'T'HH:mm")
                      .toISO({ suppressMilliseconds: true })!
                  )
                }
                className={inputCls}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-foreground/90">Duración (min)</span>
              <input
                type="number"
                min={15}
                step={15}
                value={Number.isNaN(durationMin) ? '' : durationMin}
                onChange={(e) => setDurationMin(e.target.value === '' ? NaN : +e.target.value)}
                className={inputCls}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-foreground/90">
            <input
              type="checkbox"
              className="accent-[hsl(var(--ring))]"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
            <span>Repetir</span>
          </label>

          {isRecurring && (
            <div className="space-y-3 rounded-xl border border-border/60 bg-secondary p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-foreground/90">Frecuencia</span>
                  <select
                    value={freq}
                    onChange={(e) => setFreq(e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY')}
                    className={inputCls}
                  >
                    <option value="DAILY">Diaria</option>
                    <option value="WEEKLY">Semanal</option>
                    <option value="MONTHLY">Mensual</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-foreground/90">Cada (intervalo)</span>
                  <input
                    type="number"
                    min={1}
                    value={interval}
                    onChange={(e) => setInterval(+e.target.value)}
                    className={inputCls}
                  />
                </label>
              </div>

              {freq === 'WEEKLY' && (
                <div className="flex flex-wrap gap-2">
                  {days.map(({ label, value }) => {
                    const isActive = byweekday.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setByweekday((w) => w.includes(value) ? w.filter((x) => x !== value) : [...w, value])
                        }
                        className={`${chipBase} ${isActive ? chipActive : chipInactive}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                “Todos los jueves” → Semanal / 1 / J — “Cada 15 días” → Semanal / 2 (día de inicio).
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end p-4 border-t border-border/60">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button className="btn-primary">Guardar</button>
        </div>
      </form>

      {/* Modal de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[min(92vw,28rem)] card p-6">
            <h3 className="text-lg font-semibold">¿Qué querés hacer?</h3>
            <p className="mt-1 text-sm text-muted-foreground">Este turno es parte de una serie recurrente.</p>

            <div className="mt-4 space-y-2">
              <button onClick={() => confirmDelete('uno')} className="btn-primary w-full">Cancelar solo este</button>
              <button onClick={() => confirmDelete('todos')} className="btn-danger w-full">Borrar toda la serie</button>
              <button
                onClick={() => confirmDelete('actual')}
                className="w-full btn bg-amber-500 text-black hover:brightness-110"
              >
                Convertir en único
              </button>
            </div>

            <button onClick={() => setShowDeleteModal(false)} className="mt-3 btn-ghost w-full">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
