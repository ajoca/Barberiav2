"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
 
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.10),transparent_60%)]" />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-2 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="font-serif text-4xl leading-tight md:text-5xl">
            Estilo <span className="text-primary">clásico</span>, cortes <span className="text-primary">modernos</span>.
          </h1>
          <p className="max-w-prose text-muted-foreground">
            Citas puntuales, servicio premium y productos de primera. Viví la experiencia Barbería [Nombre].
          </p>
          <div className="flex items-center gap-3">
            <Button className="bg-primary text-primary-foreground hover:opacity-90">
              <Scissors className="mr-2 size-4" /> Reservar turno
            </Button>
            <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
              Ver precios
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-4 shadow-glow"
        >
          
          <div className="aspect-[4/3] w-full rounded-xl bg-[url('/barber-hero.jpg')] bg-cover bg-center" />
          <div className="mt-4 text-sm text-muted-foreground">Barbería • Afeitado clásico • Diseño de barba</div>
        </motion.div>
      </div>
    </section>
  );
}
