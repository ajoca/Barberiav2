import { DateTime, Settings  } from 'luxon';

Settings.defaultLocale = 'es';


export const toISO = (d: Date | string) =>
  (typeof d === 'string' ? DateTime.fromISO(d) : DateTime.fromJSDate(d)).toISO();

export const startOfWeekISO = (ref = DateTime.now()) =>
  ref.startOf('week').toISO();

export const endOfWeekISO = (ref = DateTime.now()) =>
  ref.endOf('week').toISO();

export function fmtDay(dtISO: string, style: 'short' | 'long' = 'short') {
  const dt = DateTime.fromISO(dtISO).setLocale('es');

  const token = style === 'long' ? 'cccc' : 'ccc';
  return dt.toFormat(`${token} dd/LL`);
}
export function fmtTime(dtISO: string) {
  return DateTime.fromISO(dtISO).toFormat('HH:mm');
}

export function addMinutesISO(dtISO: string, minutes: number) {
  return DateTime.fromISO(dtISO).plus({ minutes }).toISO();
}

export function sameDay(aISO: string, bISO: string) {
  const a = DateTime.fromISO(aISO), b = DateTime.fromISO(bISO);
  return a.hasSame(b, 'day');
}
