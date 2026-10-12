import React from 'react';

interface EmotoInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmotoInfoModal: React.FC<EmotoInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#fcf9f4]/98 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/80 shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f0ede9] hover:bg-[#e5e2dd] flex items-center justify-center text-[#434843] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>

        <div className="mb-4">
          <span className="text-xs uppercase tracking-widest text-[#4b6151] font-semibold">
            The Philosophy & Science
          </span>
          <h2 className="font-newsreader text-2xl sm:text-3xl font-normal text-[#1c1c19] mt-0.5">
            Dr. Masaru Emoto & Water Consciousness
          </h2>
          <span className="text-xs text-[#737972] block mt-0.5">
            From "The Hidden Messages in Water" (1999)
          </span>
        </div>

        <div className="overflow-y-auto pr-1 space-y-4 text-xs sm:text-sm text-[#434843] leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-[#f0ede9]/70 border border-white/60">
            <h3 className="font-medium text-[#1c1c19] text-xs uppercase tracking-wider mb-1 text-[#4b6151]">
              The Breakthrough Experiment
            </h3>
            <p>
              Dr. Masaru Emoto exposed water to spoken words, typed messages, music, and prayers before snap-freezing droplets to -25°C. When examined under a dark-field microscope at 200× to 500× magnification, a striking phenomenon was documented:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
              <li>
                <strong className="text-[#1c1c19]">Love & Gratitude:</strong> Formed flawless, radiant, symmetrical 6-pointed hexagonal crystals resembling jewel-encrusted snowflakes.
              </li>
              <li>
                <strong className="text-[#1c1c19]">"You Make Me Sick" & Anger:</strong> Formed distorted, murky, incomplete, asymmetrical brown fractures with no hexagonal center.
              </li>
              <li>
                <strong className="text-[#1c1c19]">Classical Symphonies & 528 Hz:</strong> Formed delicate crystalline filigrees with profound harmonic balance.
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#d0e9d4]/30 border border-[#b4cdb8]/40">
            <h3 className="font-medium text-[#0b2013] text-xs uppercase tracking-wider mb-1">
              Your Daily Affirmation Ritual
            </h3>
            <p className="text-xs text-[#1c1c19]">
              The human body is approximately 60%–70% water. When you speak your daily affirmations into this sanctuary:
            </p>
            <ol className="list-decimal list-inside mt-1.5 space-y-1 text-xs text-[#364c3c]">
              <li>Take a slow deep breath to settle into presence.</li>
              <li>Hold a glass of pure water nearby if desired.</li>
              <li>Speak with heartfelt sincerity rather than mechanical repetition.</li>
              <li>Observe the fluid molecules re-crystallizing into sacred geometry.</li>
            </ol>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#f0ede9]/70 border border-white/60">
            <h3 className="font-medium text-[#1c1c19] text-xs uppercase tracking-wider mb-1">
              Solfeggio Frequency Guide
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-semibold text-[#4b6151]">528 Hz</span>
                <p className="text-[11px] text-[#737972]">Love frequency, biological repair, transformation</p>
              </div>
              <div>
                <span className="font-semibold text-[#465f72]">432 Hz</span>
                <p className="text-[11px] text-[#737972]">Verdi tuning, natural mathematical harmony</p>
              </div>
              <div>
                <span className="font-semibold text-[#645880]">639 Hz</span>
                <p className="text-[11px] text-[#737972]">Interpersonal harmony, open heart resonance</p>
              </div>
              <div>
                <span className="font-semibold text-[#8c5f4b]">174 Hz</span>
                <p className="text-[11px] text-[#737972]">Grounding vibrational foundation</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-full bg-[#4b6151] text-[#fcf9f4] font-medium text-xs hover:bg-[#3d5042] transition-colors cursor-pointer"
        >
          Close & Meditate
        </button>
      </div>
    </div>
  );
};
