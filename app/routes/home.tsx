import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Lucky Path" },
    { name: "description", content: "A charming path puzzle game" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-green-100 via-emerald-50 to-amber-50/50 flex flex-col items-center justify-center p-6 pb-20 select-none">
      <div className="text-center">
        {/* Character */}
        <svg width="88" height="88" viewBox="0 0 72 72" className="mx-auto mb-4 drop-shadow-md">
          <circle cx="36" cy="42" r="16" fill="#4ade80" />
          <circle cx="36" cy="42" r="16" fill="url(#bodyGrad)" />
          <polygon points="24,34 36,14 48,34" fill="#16a34a" />
          <rect x="21" y="32" width="30" height="5" rx="2.5" fill="#15803d" />
          <rect x="32" y="20" width="8" height="6" rx="1" fill="#fbbf24" />
          <circle cx="30" cy="39" r="3.5" fill="white" />
          <circle cx="42" cy="39" r="3.5" fill="white" />
          <circle cx="31.5" cy="39" r="2" fill="#1e293b" />
          <circle cx="43.5" cy="39" r="2" fill="#1e293b" />
          <circle cx="32" cy="38" r="0.8" fill="white" />
          <circle cx="44" cy="38" r="0.8" fill="white" />
          <path d="M31,47 Q36,52 41,47" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
          <defs>
            <radialGradient id="bodyGrad" cx="40%" cy="35%">
              <stop offset="0%" stopColor="white" stopOpacity=".25"/>
              <stop offset="100%" stopColor="black" stopOpacity=".08"/>
            </radialGradient>
          </defs>
        </svg>

        <h1 className="text-5xl font-bold text-emerald-800 tracking-tight mb-2">
          Lucky Path
        </h1>
        <p className="text-emerald-700 text-lg mb-8">
          Guide Lucky to the pot of gold
        </p>

        <Link
          to="/worlds"
          className="
            inline-block px-12 py-4 rounded-2xl font-bold text-xl text-white
            bg-gradient-to-b from-emerald-400 to-emerald-600
            shadow-lg shadow-emerald-500/25
            hover:shadow-xl hover:shadow-emerald-500/30
            hover:from-emerald-500 hover:to-emerald-700
            active:scale-95 active:shadow-md transition-all
          "
        >
          Play
        </Link>
      </div>

    </div>
  );
}
