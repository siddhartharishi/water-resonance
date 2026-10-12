import React from 'react';
import { AffirmationEntry } from '../types';

interface DailyJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: AffirmationEntry[];
  onSelectEntry: (entry: AffirmationEntry) => void;
  onClearEntries: () => void;
}

export const DailyJournalModal: React.FC<DailyJournalModalProps> = ({
  isOpen,
  onClose,
  entries,
  onSelectEntry,
  onClearEntries,
}) => {
  if (!isOpen) return null;

  // Calculate streak based on distinct dates
  const uniqueDates = new Set(entries.map((e) => new Date(e.timestamp).toDateString()));
  const streakDays = uniqueDates.size;

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
            Daily Water Affirmations Log
          </span>
          <h2 className="font-newsreader text-2xl sm:text-3xl font-normal text-[#1c1c19] mt-0.5">
            Consciousness History
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#d0e9d4]/60 rounded-full text-xs text-[#0b2013] font-medium">
              <span className="material-symbols-outlined text-sm">water_drop</span>
              <span>{streakDays} {streakDays === 1 ? 'Day' : 'Days'} Mindful Habit</span>
            </div>
            <div className="text-xs text-[#737972]">
              {entries.length} total {entries.length === 1 ? 'vibration' : 'vibrations'} recorded
            </div>
          </div>
        </div>

        {/* Entries List */}
        <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
          {entries.length === 0 ? (
            <div className="text-center py-12 text-[#737972]">
              <span className="material-symbols-outlined text-4xl text-[#737972]/40 mb-2">
                history_edu
              </span>
              <p className="font-newsreader italic text-base">No affirmations recorded yet.</p>
              <p className="text-xs mt-1">Tap the microphone to speak your first words into water.</p>
            </div>
          ) : (
            entries.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectEntry(item);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-[#f0ede9]/70 hover:bg-[#e5e2dd] transition-all cursor-pointer border border-white/60 flex items-start gap-3 group"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    item.sentiment === 'positive'
                      ? 'bg-blue-100 text-blue-700'
                      : item.sentiment === 'neutral'
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {item.sentiment === 'positive'
                      ? 'auto_awesome'
                      : item.sentiment === 'neutral'
                      ? 'bubble_chart'
                      : 'broken_image'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] text-[#737972]">{item.date}</span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        item.sentiment === 'positive'
                          ? 'bg-blue-100 text-blue-800'
                          : item.sentiment === 'neutral'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {item.coherence}% Coherent
                    </span>
                  </div>
                  <p className="font-newsreader italic text-sm text-[#1c1c19] line-clamp-2">
                    "{item.quote}"
                  </p>
                  <div
                    className={`text-[11px] mt-1 font-medium ${
                      item.sentiment === 'positive'
                        ? 'text-blue-600'
                        : item.sentiment === 'neutral'
                        ? 'text-sky-600'
                        : 'text-amber-900'
                    }`}
                  >
                    {item.primaryEmotion} • {item.frequency}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {entries.length > 0 && (
          <div className="pt-3 border-t border-[#e5e2dd] flex items-center justify-between mt-2">
            <button
              onClick={onClearEntries}
              className="text-xs text-[#737972] hover:text-[#ba1a1a] transition-colors cursor-pointer"
            >
              Clear Log
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-[#4b6151] text-white text-xs font-medium hover:bg-[#3d5042] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
