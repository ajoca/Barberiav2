// tailwind.config.ts
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",  
    "./src/app/**/*.{ts,tsx,js,jsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}",
  ],
  darkMode: "class", 
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: "hsl(var(--primary) / <alpha-value>)",
        "primary-foreground": "hsl(var(--primary-foreground) / <alpha-value>)",
        secondary: "hsl(var(--secondary) / <alpha-value>)",
        "secondary-foreground": "hsl(var(--secondary-foreground) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        "muted-foreground": "hsl(var(--muted-foreground) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        "accent-foreground": "hsl(var(--accent-foreground) / <alpha-value>)",
        card: "hsl(var(--card) / <alpha-value>)",
        "card-foreground": "hsl(var(--card-foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
      },
      borderRadius: {
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        glow:
          "0 0 0 1px hsl(var(--ring) / 0.35), 0 10px 30px -10px hsl(var(--ring) / 0.25)",
      },
    },
  },

  // 2) Safelist para clases que hoy armás en variables/strings
  safelist: [
    "input","mt-1",
    "px-3","py-1","rounded-full","border","text-sm","transition-colors","select-none",
    "bg-primary","text-primary-foreground","border-primary","hover:opacity-90",
    "bg-transparent","text-foreground/80","border-border","hover:bg-accent",
    "bg-primary/10","text-foreground","border-primary/40","shadow-glow",
    "border-b","border-border/60","border-border/50","text-muted-foreground",
    "hover:bg-accent/70","rounded",
  ],

  plugins: [animate],
  // tailwind.config.ts (agrega dentro de theme.extend)
extend: {
  // …tu extend actual
  keyframes: {
    'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
    'scale-in': {
      '0%': { opacity: '0', transform: 'scale(0.96)' },
      '100%': { opacity: '1', transform: 'scale(1)' },
    },
    'slide-up': {
      '0%': { opacity: '0', transform: 'translateY(8px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    'soft-pulse': {
      '0%, 100%': { boxShadow: '0 0 0 0 hsl(var(--ring)/0.0)' },
      '50%': { boxShadow: '0 0 0 6px hsl(var(--ring)/0.08)' },
    },
  },
  animation: {
    'fade-in': 'fade-in .35s ease-out both',
    'scale-in': 'scale-in .28s ease-out both',
    'slide-up': 'slide-up .35s ease-out both',
    'soft-pulse': 'soft-pulse 2.4s ease-in-out infinite',
  },
}

} satisfies Config;
