import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Plus_Jakarta_Sans, Manrope, Playfair_Display } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

import { BottomNavBar } from "~/components/BottomNavBar";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-headline",
  weight: ["400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Stride",
  description: "Financial wellness, reimagined",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Stride",
    startupImage: [
      {
        url: "/icons/apple-splash-1170-2532.png",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {


  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${manrope.variable} ${playfairDisplay.variable} dark`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <link rel="apple-touch-icon" href="/icons/manifest-icon-192.maskable.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-body antialiased bg-background text-on-surface min-h-screen">
        <TRPCReactProvider>
          <div className="relative">
            <main className="page-enter">
              {children}
            </main>
            <BottomNavBar />
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
