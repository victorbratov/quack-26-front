import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";

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

export const metadata: Metadata = {
  title: "skint",
  description: "a tool to avoid being skint",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Your App Name",
    startupImage: [
      {
        url: "/splash/apple-splash-1170-2532.png",
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {


  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${manrope.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <link rel="apple-touch-icon" href="/icons/manifest-icon-192.maskable.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-body antialiased bg-[#fafaf5] text-on-surface min-h-screen">
        <TRPCReactProvider>
          <div className="relative pt-6">
            <main className="pb-40">
              {children}
            </main>
            <BottomNavBar />
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
