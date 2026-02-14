// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { AuthProvider } from '@/hooks/useAuth';
import "./globals.css";

const fontSans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fontMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = { /* igual, pero actualiza description si quieres más allure */ };
export const viewport: Viewport = { /* igual */ };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className="dark"
      suppressHydrationWarning
    >
      <body
        className={`
          ${fontSans.variable} 
          ${fontMono.variable} 
          font-sans antialiased
          bg-black text-slate-100
          selection:bg-cyan-600/30 selection:text-white
        `}
      >
        {/* Anti-flash script – elegante y discreto */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const html = document.documentElement;
                html.classList.add('dark');
                html.style.colorScheme = 'dark';
              })();
            `,
          }}
        />

        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}