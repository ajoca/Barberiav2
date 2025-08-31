'use client';
import { useEffect, useState } from 'react';
import { getOccurrences } from '@/lib/schedule';
import { db } from '../../lib/db';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function StatsView() {
  const [income, setIncome] = useState(0);
  const [count, setCount] = useState(0);
  const [top, setTop] = useState<{ service: string; total: number }[]>([]);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12

const COLORS = [
  '#3B82F6',
  '#34D399', 
  '#FBBF24',
  '#F87171', 
  '#A78BFA', 
];

  const currency = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0
  });

const loadStats = async (y: number, m: number) => {
  const start = new Date(y, m - 1, 1).toISOString();
  const end = new Date(y, m, 0, 23, 59, 59).toISOString();

  const occs = await getOccurrences(start, end);
  const services = await db.services.toArray();

  const serviceMap: Record<string, { name: string; price: number }> = {};
  services.forEach(s => {
    serviceMap[s.id] = { name: s.name, price: s.price };
  });

  let total = 0;
  let c = 0;
  const map: Record<string, number> = {};

  occs.forEach(o => {
    if (o.status === 'done') {
      const svc = serviceMap[o.clientId ?? o.serviceId]; 
      if (!svc) return;
      total += svc.price;
      c++;
      map[svc.name] = (map[svc.name] ?? 0) + svc.price;
    }
  });

  setIncome(total);
  setCount(c);
  setTop(
    Object.entries(map)
      .map(([service, total]) => ({ service, total }))
      .sort((a, b) => b.total - a.total)
  );
};

  useEffect(() => {
    loadStats(year, month);
  }, [year, month]);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="card p-6 space-y-6">
      
      <div className="flex gap-2 justify-center flex-wrap">
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="border rounded px-2 py-1 dark:bg-neutral-900"
        >
          {months.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>

        <input
          type="number"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="w-24 border rounded px-2 py-1 dark:bg-neutral-900"
        />
      </div>

      
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 rounded bg-zinc-100 dark:bg-neutral-800">
          <p className="text-sm text-zinc-500">Ingresos</p>
          <p className="text-lg font-bold">{currency.format(income)}</p>
        </div>
        <div className="p-3 rounded bg-zinc-100 dark:bg-neutral-800">
          <p className="text-sm text-zinc-500">Turnos completados</p>
          <p className="text-lg font-bold">{count}</p>
        </div>
      </div>

      
      <div className="grid md:grid-cols-2 gap-6">
        
        <div className="card h-72 p-3">
          <h3 className="text-center font-medium mb-2">Servicios más vendidos</h3>
          {top.length === 0 ? (
            <p className="text-center text-sm text-zinc-500">No hay datos</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top}>
                <XAxis dataKey="service" />
                <YAxis />
                <Tooltip formatter={(v:number)=>currency.format(v)} />
                <Bar dataKey="total">
                  {top.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

       
        <div className="card h-72 p-3">
          <h3 className="text-center font-medium mb-2">Distribución de ingresos</h3>
          {top.length === 0 ? (
            <p className="text-center text-sm text-zinc-500">No hay datos</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={top}
                  dataKey="total"
                  nameKey="service"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {top.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v:number)=>currency.format(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
