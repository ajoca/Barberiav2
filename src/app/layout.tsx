import "./globals.css";
import { ThemeProvider } from "next-themes";

export const metadata = { title: "Barbería", description: "Turnos y gestión" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(212,175,55,0.12),transparent_60%)]" />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
