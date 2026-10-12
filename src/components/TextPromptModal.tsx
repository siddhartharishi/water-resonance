import React, { useState } from 'react';

interface TextPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export const TextPromptModal: React.FC<TextPromptModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
    onClose();
  };

  const emotoPresets = [
    {
      category: 'Dr. Emoto Classic Words',
      items: [
        { label: 'Love and Gratitude (愛・感謝)', text: 'Love and gratitude fill every droplet with luminous harmony.' },
        { label: 'Thank You (ありがとう)', text: 'Thank you for your life-giving pure presence.' },
        { label: 'Peace (平和)', text: 'Peace flows gently throughout my mind and heart.' },
      ],
    },
    {
      category: 'Daily Affirmations',
      items: [
        { label: 'Radiant Health', text: 'Every cell in my body is vibrating with health, vitality, and light.' },
        { label: 'Quiet Stillness', text: 'I am calm, centered, and breathing in serene stillness.' },
        { label: 'Self Compassion', text: 'I forgive myself and welcome gentle unconditional love.' },
      ],
    },
    {
      category: 'Contrast / Experimentation',
      items: [
        { label: 'Discord & Resentment (Demonstration)', text: 'I hate everything and nothing will ever be right.' },
        { label: 'Anxiety & Agitation', text: 'Everything is chaotic, terrifying, and falling apart.' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#fcf9f4]/98 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-white/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
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
            Conscious Intention
          </span>
          <h2 className="font-newsreader text-2xl font-normal text-[#1c1c19] mt-0.5">
            Impart Words into Water
          </h2>
          <p className="text-xs text-[#737972] mt-1 leading-relaxed">
            Speak your truth or type an affirmation. Observe how your acoustic intention crystallizes the molecular lattice.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="relative">
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., “Love and peace fill every cell of my body and this sacred water.”"
              className="w-full p-3.5 text-sm bg-white/70 focus:bg-white rounded-2xl border border-[#c3c8c1]/70 focus:border-[#4b6151] focus:ring-1 focus:ring-[#4b6151] outline-hidden text-[#1c1c19] placeholder:text-[#737972]/60 resize-none font-newsreader italic text-base transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2 mt-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#434843] hover:text-[#1c1c19] rounded-full transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="px-5 py-2 text-xs font-medium rounded-full bg-[#4b6151] disabled:opacity-40 text-white hover:bg-[#3d5042] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Vibrate Water</span>
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
            </button>
          </div>
        </form>

        {/* Preset Experiments */}
        <div className="overflow-y-auto space-y-4 pr-1 text-left border-t border-[#e5e2dd] pt-3">
          {emotoPresets.map((group, idx) => (
            <div key={idx}>
              <span className="text-[11px] font-semibold text-[#737972] uppercase tracking-wider block mb-1.5">
                {group.category}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((item, iIdx) => (
                  <button
                    key={iIdx}
                    type="button"
                    onClick={() => {
                      onSubmit(item.text);
                      onClose();
                    }}
                    className="text-left px-3 py-1.5 bg-[#f0ede9]/80 hover:bg-[#e5e2dd] text-[#1c1c19] rounded-xl text-xs transition-colors border border-white/60 cursor-pointer"
                  >
                    <span className="font-medium text-[#4b6151] block text-[11px]">{item.label}</span>
                    <span className="font-newsreader italic text-xs text-[#434843] line-clamp-1">"{item.text}"</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
