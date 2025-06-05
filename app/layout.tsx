import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

// Font configuration
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

// Metadata configuration - Simplified
export const metadata: Metadata = {
  title: {
    template: "%s | Golf Pass",
    default: "Golf Pass - La plateforme premium de réservation de séjours golf",
  },
  description:
    "Réservez des séjours golf premium dans les plus beaux parcours du monde. Golf Pass connecte les golfeurs passionnés avec des tour-opérateurs spécialisés.",
  keywords: [
    "golf",
    "séjours golf",
    "réservation golf",
    "voyage golf",
    "parcours de golf",
    "golf premium",
    "marketplace golf",
  ],
  authors: [{ name: "Golf Pass Team" }],
  creator: "Golf Pass",
  publisher: "Golf Pass",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("http://localhost:3000"), // Use localhost for development
  openGraph: {
    title: "Golf Pass - La plateforme premium de réservation de séjours golf",
    description:
      "Réservez des séjours golf premium dans les plus beaux parcours du monde.",
    url: "http://localhost:3000", // Use localhost for development
    siteName: "Golf Pass",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", // Placeholder, replace with actual image path
        width: 1200,
        height: 630,
        alt: "Golf Pass - Premium Golf Stays",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Golf Pass - La plateforme premium de réservation de séjours golf",
    description:
      "Réservez des séjours golf premium dans les plus beaux parcours du monde.",
    // creator: "@GolfPassApp", // Optional: Add Twitter handle
    images: ["/twitter-image.jpg"], // Placeholder, replace with actual image path
  },
};

// Viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2a9d8f" }, // Fairway Green for light mode
    { media: "(prefers-color-scheme: dark)", color: "#1d3557" },  // Dark Blue for dark mode
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr" // Content language is French
      className={`${inter.variable} ${playfair.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 antialiased dark:from-dark-blue-950 dark:to-dark-blue-900 dark:text-gray-50">
        <ThemeProvider defaultTheme="dark">
          <div className="relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-white/5 backdrop-blur-glassmorphic dark:border-black/10 dark:bg-black/5">
              <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="text-2xl font-bold text-fairway dark:text-fairway-400">
                  Golf Pass
                </div>
                <nav className="hidden md:block">
                  {/* Navigation links will go here */}
                </nav>
                <div className="flex items-center gap-4">
                  {/* Auth buttons and theme toggle will go here */}
                </div>
              </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="mt-auto border-t border-white/10 bg-white/5 py-8 backdrop-blur-glassmorphic dark:border-black/10 dark:bg-black/5">
              <div className="container mx-auto px-4">
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  © {new Date().getFullYear()} Golf Pass. Tous droits réservés.
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
