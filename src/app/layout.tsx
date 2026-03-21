import "~/styles/globals.css";

import { type Metadata } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { TopAppBar } from "~/components/TopAppBar";
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
  const pages = [
    { name: 'Home', path: '/' },
    { name: 'Actions', path: '/actions' },
    { name: 'Growth', path: '/growth' },
    { name: 'Bloom', path: '/bloom' },
    { name: 'Council', path: '/council' },
    { name: 'Harvest', path: '/harvest' },
    { name: 'Carbon', path: '/carbon' },
    { name: 'Yield', path: '/yield' },
    { name: 'Community', path: '/community' },
    { name: 'Quests', path: '/quests' },
  ];

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
          {/* Dev Switcher - Persistent on all pages */}
          <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-1 pointer-events-none">
            <div className="flex bg-zinc-900/90 backdrop-blur-md rounded-full px-4 py-1.5 shadow-xl border border-white/10 pointer-events-auto gap-3 overflow-x-auto max-w-[95vw] no-scrollbar">
              {pages.map((p) => (
                <a 
                  key={p.path} 
                  href={p.path} 
                  className="whitespace-nowrap text-[9px] font-black uppercase tracking-tighter text-zinc-400 hover:text-white transition-colors"
                >
                  {p.name}
                </a>
              ))}
            </div>
          </div>

          <div className="relative pt-6">
            <TopAppBar />
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
