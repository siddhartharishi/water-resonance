import React from 'react';
import { SentimentType } from '../types';

interface FocalCrystalProps {
  sentiment: SentimentType;
  coherence: number;
  isOpen: boolean;
  onClose: () => void;
  frequency: string;
  primaryEmotion: string;
  molecularInsight: string;
  crystallineDescription: string;
  quote?: string;
}

export const FocalCrystal: React.FC<FocalCrystalProps> = ({
  sentiment,
  coherence,
  isOpen,
  onClose,
  frequency,
  primaryEmotion,
  molecularInsight,
  crystallineDescription,
  quote,
}) => {
  if (!isOpen) return null;

  const isPositive = sentiment === 'positive';
  const isNeutral = sentiment === 'neutral';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#fcf9f4]/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#f0ede9] hover:bg-[#e5e2dd] flex items-center justify-center text-[#434843] transition-colors z-20 cursor-pointer"
          aria-label="Close crystal inspection"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-3">
          <span
            className={`text-xs tracking-widest uppercase font-semibold mb-1 ${
              isPositive ? 'text-blue-600' : isNeutral ? 'text-sky-600' : 'text-amber-900'
            }`}
          >
            Masaru Emoto Crystallography
          </span>
          <h2 className="font-newsreader text-2xl sm:text-3xl font-medium text-[#1c1c19]">
            {isPositive ? 'Blue Hexagonal Snowflake Crystal' : isNeutral ? 'Light Blue Fluid Equilibrium' : 'Brown Distorted Molecular Fracture'}
          </h2>
          <span className="text-xs text-[#737972] mt-0.5">{frequency}</span>
        </div>

        {/* Central Graphic Showcase */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto my-3 flex items-center justify-center">
          {/* Animated Glow Halo */}
          <div
            className={`absolute inset-0 rounded-full blur-2xl opacity-40 transition-all duration-700 ${
              isPositive
                ? 'bg-blue-400'
                : isNeutral
                ? 'bg-sky-300'
                : 'bg-amber-800'
            }`}
          />

          {isPositive ? (
            /* Luminous Blue Snowflake Graphic */
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full text-blue-600 animate-spin-very-slow transition-transform duration-1000"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              {/* Central Hexagonal Diamond Core */}
              <polygon
                points="100,65 130,82.5 130,117.5 100,135 70,117.5 70,82.5"
                fill="rgba(219, 234, 254, 0.55)"
                stroke="currentColor"
              />
              <circle cx="100" cy="100" r="14" fill="rgba(59, 130, 246, 0.25)" stroke="currentColor" strokeWidth="1" />
              <circle cx="100" cy="100" r="4" fill="currentColor" />

              {/* 6 Radiant Snowflake Branches with Detailed Dendrites & Sub-needles */}
              {[0, 60, 120, 180, 240, 300].map((deg, idx) => (
                <g key={idx} transform={`rotate(${deg} 100 100)`}>
                  <line x1="100" y1="100" x2="100" y2="12" strokeWidth="1.8" />
                  {/* Outer Diamond Arrow Cap */}
                  <polygon points="100,6 92,20 100,30 108,20" fill="rgba(191, 219, 254, 0.7)" />
                  {/* Primary Branch Pair */}
                  <line x1="100" y1="42" x2="78" y2="26" strokeWidth="1.4" />
                  <line x1="100" y1="42" x2="122" y2="26" strokeWidth="1.4" />
                  {/* Sub-needles on primary branch for frosty snowflake look */}
                  <line x1="88" y1="34" x2="84" y2="22" strokeWidth="1" />
                  <line x1="112" y1="34" x2="116" y2="22" strokeWidth="1" />

                  {/* Secondary Branch Pair */}
                  <line x1="100" y1="64" x2="76" y2="46" strokeWidth="1.4" />
                  <line x1="100" y1="64" x2="124" y2="46" strokeWidth="1.4" />

                  {/* Tertiary Inner Dendrite */}
                  <line x1="100" y1="80" x2="84" y2="70" strokeWidth="1.1" />
                  <line x1="100" y1="80" x2="116" y2="70" strokeWidth="1.1" />
                </g>
              ))}

              {/* Concentric Frost Geometry Rings */}
              <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
            </svg>
          ) : isNeutral ? (
            /* Light Blue Liquid Dynamic Suspension */
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full text-sky-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="100" cy="100" r="48" fill="rgba(224, 242, 254, 0.45)" stroke="currentColor" />
              {/* Hydrogen node links */}
              <line x1="100" y1="100" x2="55" y2="60" stroke="currentColor" strokeWidth="2" />
              <line x1="100" y1="100" x2="145" y2="60" stroke="currentColor" strokeWidth="2" />
              <circle cx="55" cy="60" r="14" fill="rgba(56, 189, 248, 0.35)" stroke="currentColor" />
              <circle cx="145" cy="60" r="14" fill="rgba(56, 189, 248, 0.35)" stroke="currentColor" />
              <circle cx="100" cy="100" r="22" fill="rgba(2, 132, 199, 0.6)" />
              {/* Orbital wave rings */}
              <ellipse cx="100" cy="100" rx="80" ry="38" stroke="currentColor" strokeWidth="0.8" opacity="0.6" transform="rotate(-20 100 100)" />
              <ellipse cx="100" cy="100" rx="80" ry="38" stroke="currentColor" strokeWidth="0.8" opacity="0.6" transform="rotate(40 100 100)" />
            </svg>
          ) : (
            /* Brown Discordant Fractured Distortion */
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full text-amber-900"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              {/* Jagged, broken murky brown polygon */}
              <polygon
                points="100,20 148,48 118,96 172,132 114,168 74,144 38,162 54,98 28,64 78,72"
                fill="rgba(180, 83, 9, 0.28)"
                stroke="currentColor"
              />
              {/* Chaotic internal brown fracture lines */}
              <line x1="100" y1="20" x2="114" y2="168" stroke="#78350f" strokeWidth="2.2" strokeDasharray="5 2" />
              <line x1="28" y1="64" x2="172" y2="132" stroke="#78350f" strokeWidth="2" />
              <line x1="74" y1="144" x2="148" y2="48" stroke="#92400e" strokeWidth="1.8" />
              <line x1="54" y1="98" x2="118" y2="96" stroke="#a16207" strokeWidth="1.5" />
              <circle cx="70" cy="85" r="5" fill="#78350f" />
              <circle cx="132" cy="116" r="4.5" fill="#78350f" />
              <circle cx="152" cy="38" r="3.5" fill="#92400e" />
            </svg>
          )}
        </div>

        {/* Detailed Metrics */}
        <div className="bg-[#f0ede9]/80 rounded-2xl p-4 my-2 text-sm text-[#1c1c19] space-y-2">
          {quote && (
            <div className="pb-2 border-b border-[#e5e2dd]">
              <span className="text-xs text-[#737972] block">Imparted Intention</span>
              <p className="font-newsreader italic text-[#1c1c19] text-base">{quote}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-xs text-[#737972] block">Coherence Ratio</span>
              <span
                className={`font-semibold ${
                  isPositive ? 'text-blue-600' : isNeutral ? 'text-sky-600' : 'text-amber-900'
                }`}
              >
                {coherence}% Coherent
              </span>
            </div>
            <div>
              <span className="text-xs text-[#737972] block">Vibrational Tone</span>
              <span
                className={`font-semibold ${
                  isPositive ? 'text-blue-600' : isNeutral ? 'text-sky-600' : 'text-amber-900'
                }`}
              >
                {primaryEmotion}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#e5e2dd]">
            <span className="text-xs text-[#737972] block">Emoto Microscopic Insight</span>
            <p className="text-xs leading-relaxed text-[#434843] mt-0.5">{molecularInsight}</p>
          </div>

          <div>
            <span className="text-xs text-[#737972] block">Crystal Morphology</span>
            <p className="text-xs leading-relaxed text-[#434843] mt-0.5">{crystallineDescription}</p>
          </div>
        </div>

        {/* Close action */}
        <button
          onClick={onClose}
          className={`mt-3 w-full py-2.5 rounded-full text-white font-medium text-sm transition-colors cursor-pointer ${
            isPositive
              ? 'bg-blue-600 hover:bg-blue-700'
              : isNeutral
              ? 'bg-sky-600 hover:bg-sky-700'
              : 'bg-amber-900 hover:bg-amber-950'
          }`}
        >
          Return to Sanctuary
        </button>
      </div>
    </div>
  );
};
