/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback } from 'react';
import { SentimentType, SentimentAnalysisResult, AffirmationEntry, AudioPayload } from './types';
import { WaterCanvas } from './components/WaterCanvas';
import { MicrophoneButton } from './components/MicrophoneButton';
import { FocalCrystal } from './components/FocalCrystal';
import { TextPromptModal } from './components/TextPromptModal';
import { EmotoInfoModal } from './components/EmotoInfoModal';
import { DailyJournalModal } from './components/DailyJournalModal';
import { playCrystalChime, setAmbientDrone } from './utils/audio';
import { analyzeSentimentRuleBased } from './utils/sentimentAnalyzer';
const DEFAULT_PRESETS: Record<SentimentType, SentimentAnalysisResult> = {
  positive: {
    sentiment: 'positive',
    sentimentScore: 0.94,
    coherence: 96,
    header: 'Water Resonance',
    badgeLabel: 'Blue Snowflake Crystallization',
    badgeIcon: 'auto_awesome',
    frequency: '528 Hz • Solfeggio Miracles',
    hzValue: 528,
    field: 'SACRED BLUE SNOWFLAKE MATRIX',
    primaryEmotion: 'Gratitude & Love',
    molecularInsight: 'Water bonds crystallize into radiant six-fold blue snowflake geometry in response to loving consciousness.',
    crystallineDescription: 'Exquisite 6-arm blue snowflake crystal with intricate frosty dendritic branches and an illuminated diamond core.',
    quote: '“Love, peace and boundless gratitude fill every cell of existence.”',
  },
  neutral: {
    sentiment: 'neutral',
    sentimentScore: 0.1,
    coherence: 62,
    header: 'Resting Equilibrium',
    badgeLabel: 'Light Blue Fluid Suspension',
    badgeIcon: 'bubble_chart',
    frequency: '432 Hz • Natural Baseline',
    hzValue: 432,
    field: 'DYNAMIC LIGHT BLUE H2O DRIFT',
    primaryEmotion: 'Stillness & Presence',
    molecularInsight: 'Water adapts faithfully without resistance, awaiting conscious intention in light blue fluid balance.',
    crystallineDescription: 'Harmonious light blue spherical H2O molecular clusters gently drifting in natural Brownian equilibrium.',
    quote: '“Observing stillness. Water adapts faithfully without resistance.”',
  },
  negative: {
    sentiment: 'negative',
    sentimentScore: -0.88,
    coherence: 14,
    header: 'Entropy Distortion',
    badgeLabel: 'Brown Asymmetric Distortion',
    badgeIcon: 'broken_image',
    frequency: '180 Hz • Heavy Agitation',
    hzValue: 180,
    field: 'DISCORDANT BROWN LATTICE',
    primaryEmotion: 'Dissonance & Stress',
    molecularInsight: 'Chaotic frequencies shatter crystalline cohesion into turbulent, distorted brown fragments.',
    crystallineDescription: 'Murky brown distorted asymmetrical structure with jagged spikes, fractured bond bridges, and turbid discoloration.',
    quote: '“Fear, resentment and discord shatter the crystalline matrix into chaos.”',
    positiveAffirmationTransmutation: 'I release agitation. Peace, clarity and loving presence flow through every droplet of my being.',
  },
};
const STORAGE_KEY = 'emoto_affirmation_journal_v1';
export default function App() {
  const [currentData, setCurrentData] = useState<SentimentAnalysisResult>(DEFAULT_PRESETS.neutral);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionGuide, setActionGuide] = useState<string>('Tap microphone to impart consciousness vibration');
  const [isTextModalOpen, setIsTextModalOpen] = useState<boolean>(false);
  const [isEmotoModalOpen, setIsEmotoModalOpen] = useState<boolean>(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState<boolean>(false);
  const [isCrystalZoomOpen, setIsCrystalZoomOpen] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(true);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [ambientDroneActive, setAmbientDroneActive] = useState<boolean>(false);
  // Journal history state
  const [journalEntries, setJournalEntries] = useState<AffirmationEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  // Save journal entries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(journalEntries));
    } catch (e) {
      console.warn('Failed to save journal to localStorage', e);
    }
  }, [journalEntries]);
  // Handle ambient drone audio frequency
  useEffect(() => {
    if (!isSoundMuted && ambientDroneActive) {
      setAmbientDrone(currentData.hzValue || 528, true);
    } else {
      setAmbientDrone(currentData.hzValue || 528, false);
    }
    return () => {
      setAmbientDrone(528, false);
    };
  }, [ambientDroneActive, isSoundMuted, currentData.hzValue]);
  // Main sentiment analysis caller (using backend Gemini API)
  const processAffirmation = useCallback(
    async (payload: AudioPayload | string) => {
      const isString = typeof payload === 'string';
      const text = isString ? payload.trim() : payload.text?.trim() || '';
      const audio = !isString ? payload.audio : undefined;
      const mimeType = !isString ? payload.mimeType : undefined;
      if (!text && !audio) return;
      setIsProcessing(true);
      setActionGuide('Analyzing molecular resonance with Gemini AI...');
      try {
        const res = await fetch('/api/analyze-sentiment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, audio, mimeType }),
        });
        if (!res.ok) {
          throw new Error('API response was not ok');
        }
        const data: SentimentAnalysisResult = await res.json();
        const displayQuote = data.quote || text || 'Voice intention received';
        const formattedQuote = displayQuote.startsWith('“') ? displayQuote : `“${displayQuote}”`;
        const fullData: SentimentAnalysisResult = {
          ...data,
          quote: formattedQuote,
        };
        setCurrentData(fullData);
        // Play acoustic chime according to frequency & harmony
        if (!isSoundMuted) {
          playCrystalChime(fullData.hzValue || 528, fullData.sentiment === 'positive');
        }
        // Add to journal entries
        const newEntry: AffirmationEntry = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          timestamp: Date.now(),
          quote: displayQuote,
          sentiment: fullData.sentiment,
          coherence: fullData.coherence,
          frequency: fullData.frequency,
          primaryEmotion: fullData.primaryEmotion,
          insight: fullData.molecularInsight,
        };
        setJournalEntries((prev) => [newEntry, ...prev]);
        setActionGuide(`Resonance aligned: ${fullData.primaryEmotion} (${fullData.coherence}% Coherence)`);
      } catch (err) {
        console.warn('Could not contact Gemini API endpoint, using local rule-based engine', err);
        const fallbackResult = analyzeSentimentRuleBased(text || '');
        setCurrentData(fallbackResult);
        if (!isSoundMuted) {
          playCrystalChime(fallbackResult.hzValue, fallbackResult.sentiment === 'positive');
        }
        const newEntry: AffirmationEntry = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          timestamp: Date.now(),
          quote: fallbackResult.quote || text || 'Voice vibration imparted',
          sentiment: fallbackResult.sentiment,
          coherence: fallbackResult.coherence,
          frequency: fallbackResult.frequency,
          primaryEmotion: fallbackResult.primaryEmotion,
          insight: fallbackResult.molecularInsight,
        };
        setJournalEntries((prev) => [newEntry, ...prev]);
        setActionGuide(`Resonance aligned: ${fallbackResult.primaryEmotion} (${fallbackResult.coherence}% Coherence)`);
      } finally {
        setIsProcessing(false);
      }
    },
    [isSoundMuted]
  );
  // Quick preset injector buttons (Gratitude, Equilibrium, Dissonance)
  const handleSelectPreset = (mode: SentimentType) => {
    const preset = DEFAULT_PRESETS[mode];
    setCurrentData(preset);
    if (!isSoundMuted) {
      playCrystalChime(preset.hzValue, mode === 'positive');
    }
    setActionGuide(`Resonating at ${preset.frequency}`);
  };
  const handleListenStateChange = (active: boolean) => {
    setIsListening(active);
    if (active) {
      setActionGuide('Listening to human voice cadence... Speak with intention');
    } else {
      setActionGuide('Tap microphone to impart consciousness vibration');
    }
  };
  const currentMode = currentData.sentiment;
  // Atmospheric background gradient shifts
  const getAmbientAuraClass = () => {
    if (currentMode === 'positive') {
      return 'from-blue-200/35 via-[#fcf9f4] to-indigo-100/20';
    }
    if (currentMode === 'neutral') {
      return 'from-sky-200/30 via-[#fcf9f4] to-cyan-50/20';
    }
    return 'from-amber-200/35 via-[#fcf9f4] to-stone-200/40';
  };
  const getDotColorClass = () => {
    if (currentMode === 'positive') return 'bg-blue-600';
    if (currentMode === 'neutral') return 'bg-sky-500';
    return 'bg-amber-900';
  };
  const getMeterColorClass = () => {
    if (currentMode === 'positive') return 'bg-blue-600';
    if (currentMode === 'neutral') return 'bg-sky-500';
    return 'bg-amber-900';
  };
  const getBadgeStyle = () => {
    if (currentMode === 'positive') return 'text-blue-600 bg-blue-100/70 border border-blue-200/60';
    if (currentMode === 'neutral') return 'text-sky-600 bg-sky-100/70 border border-sky-200/60';
    return 'text-amber-900 bg-amber-100/80 border border-amber-300/60';
  };
  return (
    <div className="relative min-h-screen w-full bg-[#fcf9f4] text-[#1c1c19] overflow-hidden flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      {/* Dynamic Interactive Water & Crystalline Background Canvas */}
      <WaterCanvas
        sentiment={currentMode}
        coherence={currentData.coherence}
        isListening={isListening}
        onCanvasClick={() => {
          // Subtle water splash chime on tap if enabled
          if (!isSoundMuted) {
            playCrystalChime(currentData.hzValue, currentMode === 'positive');
          }
        }}
      />
      {/* Dynamic Ambient Aura Tint */}
      <div
        className={`fixed inset-0 pointer-events-none z-0 opacity-55 transition-all duration-1000 bg-gradient-to-b ${getAmbientAuraClass()}`}
      />
      {/* Main Sanctuary UI Container */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen px-4 sm:px-6 py-4 pb-8 max-w-lg mx-auto w-full">
        {/* Top Floating Meta Island Header */}
        <header className="flex flex-col items-center gap-2 mt-1">
          {/* Top Navbar Capsule */}
          <div className="flex items-center justify-between w-full px-4 py-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-xs border border-white/70">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${getDotColorClass()}`} />
              <span className="text-xs sm:text-sm font-medium tracking-wide text-[#1c1c19]">
                {currentData.header}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* <span className="text-[11px] sm:text-xs text-[#737972] font-light tracking-wide">
                {currentData.frequency}
              </span> */}
              {/* Sound & Controls Toolbar */}
              <div className="flex items-center border-l border-[#c3c8c1]/40 pl-2 gap-1">
                {/* Solfeggio Ambient Drone */}
                <button
                  type="button"
                  onClick={() => setAmbientDroneActive(!ambientDroneActive)}
                  title={ambientDroneActive ? 'Turn off Solfeggio drone' : 'Turn on Solfeggio drone'}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    ambientDroneActive ? 'bg-sky-100 text-sky-700': 'text-[#737972] hover:bg-sky-100 hover:text-sky-700'
                  }`}
                  aria-label="Toggle Solfeggio sound drone"
                >
                  <span className="material-symbols-outlined text-sm">
                    {ambientDroneActive ? 'graphic_eq' : 'volume_up'}
                  </span>
                </button>
                {/* Zen Minimal View Toggle */}
                <button
                  type="button"
                  onClick={() => setIsZenMode(!isZenMode)}
                  title={isZenMode ? 'Show details' : 'Zen minimal view'}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isZenMode ? 'bg-sky-100 text-sky-700' :  'text-[#737972] hover:bg-sky-100 hover:text-sky-700'
                  }`}
                  aria-label="Toggle zen view"
                >
                  <span className="material-symbols-outlined text-sm">
                    {isZenMode ? 'visibility' : 'filter_vintage'}
                  </span>
                </button>
                {/* Emoto Experiment Philosophy Guide */}
                <button
                  type="button"
                  onClick={() => setIsEmotoModalOpen(true)}
                  title="Dr. Masaru Emoto experiment overview"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#737972] hover:bg-[#f0ede9] transition-colors cursor-pointer"
                  aria-label="About Masaru Emoto water experiments"
                >
                  <span className="material-symbols-outlined text-sm">info</span>
                </button>
                {/* Daily Affirmation Log History */}
                {/* <button
                  type="button"
                  onClick={() => setIsJournalModalOpen(true)}
                  title="Daily Affirmations Journal"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#737972] hover:bg-[#f0ede9] transition-colors cursor-pointer relative"
                  aria-label="Open Affirmations Log"
                >
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  {journalEntries.length > 0 && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  )}
                </button> */}
              </div>
            </div>
          </div>
          {/* State Status Chip */}
          {/* <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-700 backdrop-blur-md ${getBadgeStyle()}`}
          >
            <span className="material-symbols-outlined text-xs">{currentData.badgeIcon}</span>
            <span className="text-[11px] font-medium tracking-wider">{currentData.badgeLabel}</span>
          </div> */}
        </header>
        {/* Center Poetic Resonance Transcript Display */}
        <main
          className={`flex flex-col items-center justify-center text-center my-auto px-1 transition-all duration-700 ${
            isZenMode ? 'opacity-0 pointer-events-none scale-95 h-0 my-0 overflow-hidden' : 'opacity-100 scale-100'
          }`}
        >
          <div
            className="w-full bg-white/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-700 relative overflow-hidden border border-white/80 group"
          >
            {/* Sacred Geometry Background Accent SVG Watermark */}
            <svg
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              className={`absolute -right-8 -bottom-8 w-44 h-44 transition-transform duration-1000 ease-out pointer-events-none ${
                currentMode === 'positive'
                  ? 'rotate-45 scale-110 opacity-70 text-blue-600/20'
                  : currentMode === 'neutral'
                  ? 'rotate-0 scale-90 opacity-40 text-sky-500/15'
                  : '-rotate-45 scale-75 opacity-25 text-amber-900/20'
              }`}
            >
              <circle cx="50" cy="50" r="40" />
              <polygon points="50,10 84.6,30 84.6,70 50,90 15.4,70 15.4,30" />
              <polygon points="50,90 84.6,70 84.6,30 50,10 15.4,30 15.4,70" />
              <circle cx="50" cy="50" r="23" />
              <circle cx="50" cy="50" r="8" />
            </svg>
            <div className="relative z-10 flex flex-col items-center">
              {/* Field Tag with Sound Wave Icon */}
              <div className="flex items-center gap-2 mb-3 opacity-70">
                <span
                  className={`material-symbols-outlined text-xs ${
                    currentMode === 'positive'
                      ? 'text-blue-600'
                      : currentMode === 'neutral'
                      ? 'text-sky-600'
                      : 'text-amber-900'
                  }`}
                >
                  graphic_eq
                </span>
                <span className="text-[11px] tracking-widest uppercase font-medium text-[#737972]">
                  {currentData.field}
                </span>
              </div>
              {/* The Affirmation / Spoken Transcript Quote */}
              <p
                className="font-newsreader italic text-xl sm:text-2xl text-[#1c1c19] leading-relaxed min-h-[4.5rem] flex items-center justify-center transition-all duration-500 max-w-sm px-2"
              >
                {currentData.quote || '“Speak words of love or gratitude to see the water transform.”'}
              </p>
              {/* Transmutation suggestion if negative */}
              {currentData.positiveAffirmationTransmutation && (
                <div className="mt-3 p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-950 max-w-xs animate-fade-in">
                  <span className="text-[10px] uppercase font-semibold text-amber-800 block mb-0.5">
                    Harmonizing Remedy
                  </span>
                  <p className="font-newsreader italic text-xs">
                    "{currentData.positiveAffirmationTransmutation}"
                  </p>
                </div>
              )}
              {/* Dynamic Lattice Coherence Bar */}
              <div className="w-full max-w-[210px] mt-4 flex flex-col items-center gap-1.5">
                <div className="w-full h-1.5 bg-[#f0ede9] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getMeterColorClass()}`}
                    style={{ width: `${currentData.coherence}%` }}
                  />
                </div>
                <div className="flex justify-between w-full text-[11px] text-[#737972]">
                  <span>Entropy</span>
                  <span
                    className={`font-semibold ${
                      currentMode === 'positive'
                        ? 'text-blue-600'
                        : currentMode === 'neutral'
                        ? 'text-sky-600'
                        : 'text-amber-900'
                    }`}
                  >
                    {currentData.coherence}% Coherent
                  </span>
                </div>
              </div>
              {/* Inspect Crystal Button */}
              <button
                type="button"
                onClick={() => setIsCrystalZoomOpen(true)}
                className={`mt-4 inline-flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                  currentMode === 'positive'
                    ? 'text-blue-600 hover:text-blue-700'
                    : currentMode === 'neutral'
                    ? 'text-sky-600 hover:text-sky-700'
                    : 'text-amber-900 hover:text-amber-950'
                }`}
              >
                <span className="material-symbols-outlined text-xs">search</span>
                <span>Inspect Crystal Structure</span>
              </button>
            </div>
          </div>
        </main>
        {/* Bottom Controls & Voice Interaction Island */}
        <footer className="flex flex-col items-center gap-4 w-full mt-4">
          {/* Quick Sentiment Intent Injectors (Gratitude, Equilibrium, Dissonance) */}
          <div
            className={`relative -translate-y-3 flex items-center justify-center gap-2 flex-wrap w-full transition-all duration-500 ${
              isZenMode ? 'opacity-40 hover:opacity-100' : 'opacity-100'
            }`}
          >
            <button
              type="button"
              onClick={() => handleSelectPreset('positive')}
              className={`group px-3.5 py-1.5 backdrop-blur-md rounded-full shadow-2xs hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer border ${
                currentMode === 'positive'
                  ? 'bg-white border-blue-500/50 text-blue-600 font-semibold'
                  : 'bg-white/80 border-white/60 text-[#1c1c19]'
              }`}
            >
              <span className="text-xs">✨</span>
              <span className="text-xs">Gratitude </span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('neutral')}
              className={`group px-3.5 py-1.5 backdrop-blur-md rounded-full shadow-2xs hover:bg-sky-50 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer border ${
                currentMode === 'neutral'
                  ? 'bg-white border-sky-400/50 text-sky-600 font-semibold'
                  : 'bg-white/80 border-white/60 text-[#1c1c19]'
              }`}
            >
              <span className="text-xs">🌿</span>
              <span className="text-xs">Equilibrium</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('negative')}
              className={`group px-3.5 py-1.5 backdrop-blur-md rounded-full shadow-2xs hover:bg-amber-50 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer border ${
                currentMode === 'negative'
                  ? 'bg-white border-amber-800/50 text-amber-900 font-semibold'
                  : 'bg-white/80 border-white/60 text-[#1c1c19]'
              }`}
            >
              <span className="text-xs">⚡</span>
              <span className="text-xs">Dissonance</span>
            </button>
          </div>
          {/* Tactile Resonant Microphone Trigger */}
          <div className="relative flex items-center justify-center my-1">
            <MicrophoneButton
              sentiment={currentMode}
              isListening={isListening}
              isProcessing={isProcessing}
              onTranscript={processAffirmation}
              onToggleListen={handleListenStateChange}
              onOpenTextInput={() => setIsTextModalOpen(true)}
              onInterimText={(interim) => {
              // Analyze a rolling window, not the entire session transcript.
              // This lets a new emotion replace the previous one while the user
              // is still speaking (e.g. positive words followed by negative words).
              const words = interim.trim().split(/\s+/).filter(Boolean);
              const recentSpeech = words.slice(-10).join(' ');
              if (!recentSpeech) return;
              const liveSentiment = analyzeSentimentRuleBased(recentSpeech);
              setCurrentData((previous) => {
                // Avoid flickering to Equilibrium on short neutral fragments.
                // Meaningful positive/negative language in the rolling window can
                // still change the water's target structure immediately.
                const hasEnoughContext = words.length >= 4;
                const nextSentiment =
                  liveSentiment.sentiment === 'neutral' &&
                  previous.sentiment !== 'neutral' &&
                  !hasEnoughContext
                    ? previous.sentiment
                    : liveSentiment.sentiment;
                const preset = DEFAULT_PRESETS[nextSentiment];
                return {
                  ...preset,
                  sentimentScore:
                    nextSentiment === liveSentiment.sentiment
                      ? liveSentiment.sentimentScore
                      : previous.sentimentScore,
                  coherence:
                    nextSentiment === liveSentiment.sentiment
                      ? liveSentiment.coherence
                      : previous.coherence,
                  primaryEmotion:
                    nextSentiment === liveSentiment.sentiment
                      ? liveSentiment.primaryEmotion
                      : previous.primaryEmotion,
                  quote: previous.quote,
                };
              });
              setActionGuide(`Hearing: “${interim}”`);
            }}
              onStatusChange={(status) => setActionGuide(status)}
            />
          </div>
          {/* Action Subtitle Note */}
          <p className="text-xs text-[#737972] text-center tracking-normal min-h-[1.2rem]">
            {actionGuide}
          </p>
        </footer>
      </div>
      {/* Close-Up Crystal Inspector Modal */}
      <FocalCrystal
        isOpen={isCrystalZoomOpen}
        onClose={() => setIsCrystalZoomOpen(false)}
        sentiment={currentMode}
        coherence={currentData.coherence}
        frequency={currentData.frequency}
        primaryEmotion={currentData.primaryEmotion}
        molecularInsight={currentData.molecularInsight}
        crystallineDescription={currentData.crystallineDescription}
        quote={currentData.quote}
      />
      {/* Type Affirmation or Choose Classic Emoto Words Modal */}
      <TextPromptModal
        isOpen={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        onSubmit={processAffirmation}
      />
      {/* Emoto Experiment Philosophy & Guidance Modal */}
      <EmotoInfoModal
        isOpen={isEmotoModalOpen}
        onClose={() => setIsEmotoModalOpen(false)}
      />
      {/* Daily Affirmations History Log Modal */}
      {/* <DailyJournalModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        entries={journalEntries}
        onSelectEntry={(entry) => {
          setCurrentData({
            sentiment: entry.sentiment,
            sentimentScore: entry.sentiment === 'positive' ? 0.9 : entry.sentiment === 'neutral' ? 0.0 : -0.85,
            coherence: entry.coherence,
            header:
              entry.sentiment === 'positive'
                ? 'Water Resonance'
                : entry.sentiment === 'neutral'
                ? 'Resting Equilibrium'
                : 'Entropy Distortion',
            badgeLabel:
              entry.sentiment === 'positive'
                ? 'Harmonic Crystallization'
                : entry.sentiment === 'neutral'
                ? 'Fluid Molecular Suspension'
                : 'Asymmetric Discordance',
            badgeIcon:
              entry.sentiment === 'positive'
                ? 'auto_awesome'
                : entry.sentiment === 'neutral'
                ? 'bubble_chart'
                : 'broken_image',
            frequency: entry.frequency,
            hzValue: entry.sentiment === 'positive' ? 528 : entry.sentiment === 'neutral' ? 432 : 180,
            field:
              entry.sentiment === 'positive'
                ? 'SACRED HEXAGONAL ARRAY'
                : entry.sentiment === 'neutral'
                ? 'DYNAMIC H2O DRIFT'
                : 'DISCORDANT LATTICE',
            primaryEmotion: entry.primaryEmotion,
            molecularInsight: entry.insight,
            crystallineDescription:
              entry.sentiment === 'positive'
                ? 'Sacred 6-fold hexagonal ice crystal.'
                : entry.sentiment === 'neutral'
                ? 'Fluid liquid molecular suspension.'
                : 'Fractured asymmetrical shards.',
            quote: `“${entry.quote}”`,
          });
        }}
        onClearEntries={() => setJournalEntries([])}
      /> */}
    </div>
  );
}