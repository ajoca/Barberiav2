/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from './db';

export async function exportJSON() {
  const [clients, appointments, exceptions] = await Promise.all([
    db.clients.toArray(),
    db.appointments.toArray(),
    db.exceptions.toArray(),
  ]);
  return { version: 1, clients, appointments, exceptions };
}

export async function importJSON(data: any) {
  if (!data || !data.version) throw new Error('Archivo inválido');
  // merge simple por id (reemplaza si existe)
  await db.transaction('rw', db.clients, db.appointments, db.exceptions, async () => {
    for (const c of data.clients ?? []) await db.clients.put(c);
    for (const a of data.appointments ?? []) await db.appointments.put(a);
    for (const e of data.exceptions ?? []) await db.exceptions.put(e);
  });
}
