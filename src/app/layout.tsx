import "~/styles/globals.css";

import { type Metadata } from "next";
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
  title: "Stride - Digital Sanctuary",
  description: "A mindful financial ecosystem.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
