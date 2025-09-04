import { RRule } from 'rrule';
import { DateTime, Settings } from 'luxon';
import { db, Appointment } from './db';

// ===== Zona fija y helper ISO local =====
const ZONE = 'America/Montevideo';
Settings.defaultZone = ZONE;
const toLocalISO = (d: DateTime) =>
  d.setZone(ZONE).toISO({ suppressMilliseconds: true, includeOffset: false })!;

function toRRule(a: Appointment) {
  if (!a.isRecurring || !a.rrule) return null;
  const start = DateTime.fromISO(a.startDateTime, { zone: ZONE });
  const mapWeekday = (n: number) =>
    [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU][n];

  return new RRule({
    freq: { DAILY: RRule.DAILY, WEEKLY: RRule.WEEKLY, MONTHLY: RRule.MONTHLY }[a.rrule.freq],
    interval: a.rrule.interval ?? 1,
    byweekday: a.rrule.byweekday?.map(mapWeekday),
    dtstart: start.toJSDate(), // usa la hora local fijada por ZONE
    until: a.rrule.until ? DateTime.fromISO(a.rrule.until, { zone: ZONE }).toJSDate() : undefined,
    count: a.rrule.count,
  });
}

export async function isSlotAvailable(
  startISO: string,
  durationMin: number,
  ignoreBaseId?: string
) {
  const s = DateTime.fromISO(startISO, { zone: ZONE });
  const eISO = toLocalISO(s.plus({ minutes: durationMin }));
  const dayStart = toLocalISO(s.startOf('day'));
  const dayEnd = toLocalISO(s.endOf('day'));
  const occs = await getOccurrences(dayStart, dayEnd);

  return !occs.some((o) => {
    const baseId = o.id.split('::')[0];
    if (ignoreBaseId && baseId === ignoreBaseId) return false;
    return overlaps(startISO, eISO, o.start, o.end);
  });
}

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  const A = new Date(aStart).getTime();
  const B = new Date(aEnd).getTime();
  const C = new Date(bStart).getTime();
  const D = new Date(bEnd).getTime();
  return A < D && C < B;
}

export async function getOccurrences(rangeStartISO: string, rangeEndISO: string) {
  const [apps, exs] = await Promise.all([
    db.appointments.toArray(),
    db.exceptions.toArray(),
  ]);

  const out: Array<{
    id: string;
    start: string;
    end: string;
    title?: string;
    clientId?: string;
    serviceId: string;
    status?: string;
    price?: number;
  }> = [];

  const rStart = DateTime.fromISO(rangeStartISO, { zone: ZONE });
  const rEnd = DateTime.fromISO(rangeEndISO, { zone: ZONE });
  const now = DateTime.now().setZone(ZONE);

  for (const a of apps) {
    const duration = a.durationMin;
    const start = DateTime.fromISO(a.startDateTime, { zone: ZONE });
    const end = start.plus({ minutes: duration });

    // --- No recurrente ---
    if (!a.isRecurring) {
      let status = a.status ?? 'pending';
      if (status === 'pending' && end < now) {
        status = 'done';
        await db.appointments.update(a.id, { status });
      }
      if (end > rStart && start < rEnd) {
        out.push({
          id: a.id,
          start: toLocalISO(start),
          end: toLocalISO(end),
          title: a.title,
          serviceId: a.serviceId,
          clientId: a.clientId,
          status,
        });
      }
      continue;
    }

    // --- Recurrente ---
    const rule = toRRule(a);
    if (!rule) continue;

    const dates = rule.between(rStart.toJSDate(), rEnd.toJSDate(), true);

    for (const d of dates) {
      const s = DateTime.fromJSDate(d).setZone(ZONE);
      const keyISO = toLocalISO(s);

      const related = exs.filter(
        (x) => x.appointmentId === a.id && x.originalDateTime === keyISO
      );
      if (related.find((x) => x.type === 'skip')) continue;

      const move = related.find((x) => x.type === 'move');
      const start2 = move?.newStartDateTime
        ? DateTime.fromISO(move.newStartDateTime, { zone: ZONE })
        : s;
      const dur = move?.newDurationMin ?? duration;
      const end2 = start2.plus({ minutes: dur });

      let status: 'pending' | 'done' = 'pending';
      if (end2 < now) status = 'done';

      out.push({
        id: a.id + '::' + keyISO,
        start: toLocalISO(start2),
        end: toLocalISO(end2),
        title: a.title,
        serviceId: a.serviceId,
        clientId: a.clientId,
        status,
      });
    }
  }

  return out;
}
