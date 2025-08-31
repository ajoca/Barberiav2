"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Menu, Scissors } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group inline-flex items-center gap-2">
          <div className="rounded-xl border border-primary/30 p-2 shadow-glow group-hover:shadow-glow transition">
            <Scissors className="size-5 text-primary" />
          </div>
          <span className="font-serif text-xl tracking-wide">Barbería <span className="text-primary">[Nombre]</span></span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#servicios" className="text-sm text-muted-foreground hover:text-foreground">Servicios</Link>
          <Link href="#agenda" className="text-sm text-muted-foreground hover:text-foreground">Agenda</Link>
          <Link href="#precios" className="text-sm text-muted-foreground hover:text-foreground">Precios</Link>
          <Link href="#contacto" className="text-sm text-muted-foreground hover:text-foreground">Contacto</Link>
          <Button className="bg-primary text-primary-foreground hover:opacity-90">Reservar</Button>
        </nav>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="Abrir menú">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background">
              <div className="mt-8 flex flex-col gap-4">
                <Link href="#servicios">Servicios</Link>
                <Link href="#agenda">Agenda</Link>
                <Link href="#precios">Precios</Link>
                <Link href="#contacto">Contacto</Link>
                <Button className="mt-4 bg-primary text-primary-foreground">Reservar</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
