// src/components/Hero.tsx
import React from "react";

export default function Hero() {
  return (
    <header className="relative overflow-hidden">
      {/* Decorative background layers (positioned absolutely) */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-hero-radial" />
        <svg className="absolute inset-0 w-full h-full" aria-hidden>
          {/* subtle diagonal wave - purely decorative */}
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0" stopColor="#052017" stopOpacity="0.12" />
              <stop offset="1" stopColor="#08302a" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#g1)" />
        </svg>

        {/* noise overlay for texture (very subtle) */}
        <div className="absolute inset-0 bg-noise opacity-10" />

        {/* animated floating leaves */}
        <div className="absolute inset-0 leaf-layer" aria-hidden>
          <span className="leaf leaf-1" />
          <span className="leaf leaf-2" />
          <span className="leaf leaf-3" />
        </div>
      </div>

      {/* content container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-28 lg:py-36">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-700/20 mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 12a9 9 0 1118 0 9 9 0 01-18 0z" stroke="#34D399" strokeWidth="1.2" strokeOpacity="0.85" />
              <path d="M7.5 12.5l2.5-2.5 2 2 3-3" stroke="#34D399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-emerald-300 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            Green Climate Weather Dashboard
          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-slate-200/90">
            Advanced weather insights powered by sustainable AI principles — monitor global climate data with low-latency, high-impact visuals.
          </p>

          <div className="mt-10 flex justify-center gap-4 flex-col sm:flex-row">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 px-6 py-3 text-base font-medium text-slate-900 shadow-md"
            >
              Access Dashboard
              <svg className="ml-2" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14" stroke="#042A21" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 6l6 6-6 6" stroke="#042A21" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            <a
              href="/weather"
              className="inline-flex items-center justify-center rounded-full border border-emerald-500 px-6 py-3 text-base font-medium text-emerald-200 hover:bg-emerald-900/20"
            >
              Explore Weather
            </a>
          </div>

          {/* feature cards (responsive stack) */}
          <div className="mt-12 grid gap-6 grid-cols-1 sm:grid-cols-3 lg:grid-cols-3">
            <div className="p-6 rounded-2xl bg-emerald-900/10 border border-emerald-800/30">
              <h3 className="font-semibold text-emerald-200">Real-time Analytics</h3>
              <p className="mt-2 text-slate-200/80 text-sm">Access comprehensive weather & air quality metrics across the globe.</p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-900/10 border border-emerald-800/30">
              <h3 className="font-semibold text-emerald-200">Global Coverage</h3>
              <p className="mt-2 text-slate-200/80 text-sm">Monitor climate conditions across major cities with detailed insights.</p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-900/10 border border-emerald-800/30">
              <h3 className="font-semibold text-emerald-200">Sustainability Focus</h3>
              <p className="mt-2 text-slate-200/80 text-sm">Built with green AI principles to minimize environmental impact.</p>
            </div>
          </div>
        </div>
      </div>

      {/* decorative bottom fade */}
      <div aria-hidden className="pointer-events-none absolute left-0 right-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black/40" />
    </header>
  );
}
