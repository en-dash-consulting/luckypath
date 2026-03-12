import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Lucky Path" },
    { name: "description", content: "A charming path puzzle game" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-emerald-50 to-amber-50/50 flex flex-col items-center justify-center p-6 select-none">
      <div className="text-center">
        {/* Character */}
        <svg width="72" height="72" viewBox="0 0 72 72" className="mx-auto mb-3 drop-shadow-md">
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

        <h1 className="text-4xl font-bold text-emerald-700 tracking-tight mb-1">
          Lucky Path
        </h1>
        <p className="text-emerald-600/60 text-sm mb-6">
          Guide Lucky to the pot of gold
        </p>

        <Link
          to="/worlds"
          className="
            inline-block px-10 py-3 rounded-2xl font-bold text-lg text-white
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

      {/* En Dash branding */}
      <a
        href="https://endash.us"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-5 flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity"
      >
        <svg width="18" height="18" viewBox="0 0 330 330" fill="none">
          <rect x="7.5" y="7.5" width="315" height="315" stroke="currentColor" strokeWidth="15"/>
          <path d="M315 15H15V315H315V15Z" fill="#001769"/>
          <path d="M315 232.119H47.0074V247.705H315V232.119Z" fill="#00E5B9"/>
          <path d="M139.795 164.997L145.324 169.838C140.942 178.372 126.191 192.894 100.589 192.894C71.774 192.894 45.0248 174.678 45.0248 139.625C45.0248 103.424 73.6102 85.438 102.425 85.438C127.088 85.438 146.471 98.8126 146.471 119.323C146.471 137.538 131.261 140.084 106.807 141.002L81.4555 141.92C77.3033 142.15 76.3853 145.613 77.7624 150.913C83.5212 167.522 96.8958 176.974 113.964 176.974C122.727 176.995 131.72 174.679 139.795 164.997ZM74.5491 124.185C74.3196 131.112 76.6148 133.866 82.624 133.866H94.851C114.673 133.866 120.682 127.648 120.682 117.028C120.682 105.26 112.837 94.2014 99.0031 94.2014C83.3125 94.2222 75.6967 106.658 74.5491 124.185Z" fill="white"/>
          <path d="M244.225 173.531V131.571C244.225 114.503 237.068 102.986 223.005 102.986C208.253 102.986 199.261 114.524 199.261 131.571V169.608C199.261 179.519 203.183 182.754 213.783 183.672V191.517H156.842V183.672C167.671 182.754 171.593 179.519 171.593 169.608V112.187C171.593 101.588 167.212 98.8128 156.842 99.7308V91.8855L189.12 85.8972C195.797 84.7496 199.261 87.7333 199.261 93.054C199.261 101.358 202.954 103.424 205.937 99.9812C211.008 94.4519 220.23 85 238.445 85C255.284 85 271.871 93.3044 271.871 125.583V171.006C271.871 178.622 275.794 181.376 283.639 179.77V187.615C279.487 190.849 270.953 192.685 264.277 192.685C251.611 192.664 244.225 185.988 244.225 173.531Z" fill="white"/>
        </svg>
        <span className="text-[11px] text-gray-500 font-medium">Built by En Dash</span>
      </a>
    </div>
  );
}
