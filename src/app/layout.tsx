import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Mejor performance: muestra texto inmediatamente
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Metadata enriquecida para SEO y PWA
export const metadata: Metadata = {
  title: {
    default: "Curie | Autonomía Biológica",
    template: "%s | Curie Intelligence"
  },
  description: "Monitoreo médico de alta precisión para atletas de élite. Análisis de composición corporal, telemetría submarina y optimización hormonal.",
  keywords: ["biométricos", "InBody", "buceo", "optimización hormonal", "telemetría médica"],
  authors: [{ name: "Visionary AI Labs" }],
  creator: "Visionary AI",
  publisher: "Visionary AI",
  
  // Open Graph para compartir
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://curie.visionaryai.lat",
    siteName: "Curie Intelligence",
    title: "Curie | Soberanía Biológica",
    description: "Tu laboratorio médico personal en la nube.",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "Curie Dashboard"
    }]
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Curie Intelligence",
    description: "Monitoreo médico de precisión para atletas.",
    images: ["/og-image.jpg"]
  },
  
  // Iconos y PWA
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico"
  },
  
  // Seguridad
  other: {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  }
};

// Viewport separado (recomendado por Next.js 14+)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000", // Barra de navegador negra en móviles
  colorScheme: "dark" // Forzar dark mode nativo
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="es" // Cambiado a español (tu audiencia)
      className="dark" // Forzar dark mode en HTML
      suppressHydrationWarning // Evita warnings de hidratación con theme
    >
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          font-sans
          antialiased
          bg-black
          text-slate-200
          selection:bg-cyan-500/30
          selection:text-cyan-100
        `}
      >
        {/* Prevenir flash de tema claro */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.classList.add('dark');
                document.documentElement.style.colorScheme = 'dark';
              })()
            `
          }}
        />
        
        {children}
      </body>
    </html>
  );
}