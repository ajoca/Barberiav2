import Dexie from 'dexie';
import { db } from './db';

export async function resetDatabase() {
  
  await db.close();
  await Dexie.delete('barber_offline');

  location.reload();
}