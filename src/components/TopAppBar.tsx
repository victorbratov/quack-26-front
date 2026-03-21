"use client";

import React from "react";
import Image from "next/image";

export const TopAppBar = () => {
  return (
    <header className="sticky top-4 mx-4 rounded-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl flex justify-between items-center px-6 py-2.5 w-[calc(100%-2rem)] z-50 shadow-[0_12px_40px_rgba(26,28,25,0.05)] border border-white/20">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden relative">
          <Image 
            alt="User Avatar" 
            fill
            className="object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCh482fn-kgYaB1tauWVUrM86Fzb9DDIwUpj-NkPUpN9PsthBlXPJ3lmKZRst9MpAwCh_MnhVyDyiOEqFEGTfW6ferr8YusLEZLuYXSer3borPB4TcDU-_0MUo0GeqKpeLI7rc6rwdge1ETat31zy_kKw-_P4kZimvZ2MQ5hteEPPa162esm62JgU0RVFSIf8OL3e_sPf4h5vBtBdgB2Ru0ZdMGlIbqWXK2hdt4WgRt9BfI9ex88kLHLsfWTdnHczTaQ-RAWZLhE6Y"
          />
        </div>
        <span className="text-xl font-bold text-emerald-900 dark:text-emerald-50 font-headline tracking-tight">Stride</span>
      </div>
      <button className="w-9 h-9 rounded-full flex items-center justify-center text-emerald-800 dark:text-emerald-200 hover:bg-white/40 transition-colors">
        <span className="material-symbols-outlined text-xl">eco</span>
      </button>
    </header>
  );
};
