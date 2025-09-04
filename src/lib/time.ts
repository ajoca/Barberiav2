import { DateTime, Settings } from 'luxon';

Settings.defaultLocale = 'es';
const ZONE = 'America/Montevideo';
Settings.defaultZone = ZONE;

/** ISO local sin milisegundos ni offset (no se corre a UTC) */
const toLocalISO = (d: DateTime) =>
  d.setZone(ZONE).toISO({ suppressMilliseconds: true, includeOffset: false })!;

export const toISO = (d: Date | string) => {
  const dt = typeof d === 'string'
    ? DateTime.fromISO(d, { zone: ZONE })
    : DateTime.fromJSDate(d).setZone(ZONE);
  return toLocalISO(dt);
};

export const startOfWeekISO = (ref = DateTime.now().setZone(ZONE)) =>
  toLocalISO(ref.startOf('week'));

export const endOfWeekISO = (ref = DateTime.now().setZone(ZONE)) =>
  toLocalISO(ref.endOf('week'));

export function fmtDay(dtISO: string, style: 'short' | 'long' = 'short') {
  const dt = DateTime.fromISO(dtISO, { zone: ZONE }).setLocale('es');
  const token = style === 'long' ? 'cccc' : 'ccc';
  return dt.toFormat(`${token} dd/LL`);
}

export function fmtTime(dtISO: string) {
  return DateTime.fromISO(dtISO, { zone: ZONE }).toFormat('HH:mm');
}

export function addMinutesISO(dtISO: string, minutes: number) {
  return toLocalISO(DateTime.fromISO(dtISO, { zone: ZONE }).plus({ minutes }));
}

export function sameDay(aISO: string, bISO: string) {
  const a = DateTime.fromISO(aISO, { zone: ZONE });
  const b = DateTime.fromISO(bISO, { zone: ZONE });
  return a.hasSame(b, 'day');
}
