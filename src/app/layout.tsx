// src/app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Barbería",
  description: "Turnos y gestión",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      {/* next-themes pondrá/removerá la clase "dark" en <html> */}
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {/* Glow sutil de fondo */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(212,175,55,0.12),transparent_60%)]" />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
