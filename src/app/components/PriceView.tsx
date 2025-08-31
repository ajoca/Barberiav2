'use client';
import { useEffect, useState } from 'react';
import { db } from '../../lib/db';

type Service = { id: string; name: string; price: number };


export default function PricesView() {
  const [services, setServices] = useState<Service[]>([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState<number | ''>('');

  
  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    const all = await db.services.toArray();
    setServices(all);
  }

  async function addService() {
    if (!newName || !newPrice) return;
    const s: Service = {
      id: crypto.randomUUID(),
      name: newName,
      price: Number(newPrice),
    };
    await db.services.add(s);
    setNewName('');
    setNewPrice('');
    loadServices();
  }

  async function updatePrice(id: string, price: number) {
    await db.services.update(id, { price });
    loadServices();
  }

  async function removeService(id: string) {
    await db.services.delete(id);
    loadServices();
  }

  return (
    <div className="card p-4 space-y-4">
      <h2 className="text-lg font-bold">💲 Precios de servicios</h2>

      
      <div className="space-y-2">
        {services.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <span className="flex-1">{s.name}</span>
            <input
              type="number"
              value={s.price}
              onChange={(e) => updatePrice(s.id, Number(e.target.value))}
              className="border rounded px-2 py-1 w-28 text-right"
            />
            <button
              onClick={() => removeService(s.id)}
              className="px-2 py-1 rounded text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              ✕
            </button>
          </div>
        ))}
        {services.length === 0 && (
          <p className="text-sm text-zinc-500">No hay servicios aún</p>
        )}
      </div>

      
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Servicio (ej: Corte)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 border rounded px-2 py-1"
        />
        <input
          type="number"
          placeholder="Precio"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-32 border rounded px-2 py-1"
        />
        <button
          onClick={addService}
          className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-500"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
