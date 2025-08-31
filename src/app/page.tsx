'use client';
console.log("⚡ page.tsx NUEVO cargado");
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

import WeekView from './components/WeekView';
import StatsBar from './components/StatsBar';
import StatsView from './components/StatsView';
import PricesView from './components/PriceView';

import { exportJSON, importJSON } from '@/lib/backup';
import { resetDatabase } from '@/lib/reset-db';
import { saveAs } from 'file-saver';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Upload, Trash2, CalendarDays, DollarSign, BarChart3 } from 'lucide-react';

import { cn } from '@/lib/utils';

type View = 'week' | 'prices' | 'stats';

function Toggle({
  active,
  onClick,
  children,
  icon: Icon,
  ariaCurrent,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  ariaCurrent?: 'page';
}) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        onClick={onClick}
        aria-current={ariaCurrent}
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-300 ease-in-out',
          active
            ? 'bg-primary text-primary-foreground shadow-md hover:scale-105'
            : 'border border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-105'
        )}
        variant="ghost"
      >
        <Icon className="h-4 w-4" />
        {children}
      </Button>
    </motion.div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>('week');
  const [statsTick, setStatsTick] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const bumpStats = () => setStatsTick((t) => t + 1);

  async function handleExport() {
    const data = await exportJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `turnos-backup-${new Date().toISOString().slice(0, 10)}.json`);
  }

  async function handleImportFile(file?: File) {
    if (!file) return;
    const txt = await file.text();
    await importJSON(JSON.parse(txt));
    window.location.reload();
  }

  function triggerImport() {
    fileRef.current?.click();
  }

  async function handleReset() {
    if (!confirm('Esto borra TODOS los turnos y datos locales. ¿Continuar?')) return;
    await resetDatabase();
  }

  return (
    <main className="space-y-6 relative isolate overflow-hidden">
      {/* Background visual */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-tr from-black via-zinc-900 to-gray-800 opacity-90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-border/60 bg-card/60 backdrop-blur shadow-xl">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Acciones */}
              <div aria-label="Acciones" className="flex w-full flex-wrap items-center gap-2">
                <Button variant="ghost" className="border border-border/60 hover:border-primary/50" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>

                <input
                  ref={fileRef}
                  id="import-json"
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => handleImportFile(e.target.files?.[0] || undefined)}
                />
                <Button variant="ghost" className="border border-border/60 hover:border-primary/50" onClick={triggerImport}>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar
                </Button>

                <Button
                  variant="destructive"
                  className="border border-red-400/40 bg-red-900/20 text-red-300 hover:bg-red-900/30"
                  onClick={handleReset}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Reiniciar
                </Button>

                <div className="mx-1 hidden h-6 w-px bg-border md:block" />

                {/* Vistas */}
                <nav className="flex flex-1 flex-wrap items-center justify-start gap-2 md:justify-end" aria-label="Vistas">
                  <Toggle active={view === 'week'} onClick={() => setView('week')} icon={CalendarDays} ariaCurrent={view === 'week' ? 'page' : undefined}>
                    Agenda
                  </Toggle>
                  <Toggle active={view === 'prices'} onClick={() => setView('prices')} icon={DollarSign} ariaCurrent={view === 'prices' ? 'page' : undefined}>
                    Precios
                  </Toggle>
                  <Toggle active={view === 'stats'} onClick={() => setView('stats')} icon={BarChart3} ariaCurrent={view === 'stats' ? 'page' : undefined}>
                    Estadísticas
                  </Toggle>
                </nav>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CONTENIDO */}
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        {view === 'week' && (
          <>
            <StatsBar refreshKey={statsTick} />
            <WeekView onChanged={bumpStats} />
          </>
        )}

        {view === 'prices' && (
          <Card className="border-border/60 bg-card/70 shadow-md">
            <CardContent className="p-4">
              <PricesView />
            </CardContent>
          </Card>
        )}

        {view === 'stats' && (
          <Card className="border-border/60 bg-card/70 shadow-md">
            <CardContent className="p-4">
              <StatsView />
            </CardContent>
          </Card>
        )}
      </motion.div>
    </main>
  );
}
