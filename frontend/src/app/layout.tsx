/**
 * Root Layout — SMART SMOE IFDL
 * Global providers, fonts, theme
 */
import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from '@/components/providers/query-provider';
import { AppShell } from '@/components/providers/app-shell';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: {
    default: 'SMART SMOE IFDL',
    template: '%s | SMART SMOE IFDL',
  },
  description:
    'Système Intelligent de Management ISO 21001 — Master IFDL, ESEF Berrechid, Université Hassan 1er',
  keywords: ['ISO 21001', 'SMOE', 'IFDL', 'Qualité', 'Management', 'ESEF'],
  authors: [{ name: 'ESEF Berrechid' }],
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${outfit.variable} ${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AppShell>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '13px',
                  },
                }}
              />
            </AppShell>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
