// Web Audio API harmonic Solfeggio sound synthesizer

let audioCtx: AudioContext | null = null;
let activeDroneGain: GainNode | null = null;
let activeOscillators: OscillatorNode[] = [];

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a gentle harmonic bell chime tuned to the crystal frequency
 */
export function playCrystalChime(hz: number = 528, isHarmonic: boolean = true) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
    masterGain.connect(ctx.destination);

    if (isHarmonic) {
      // Harmonic series: Fundamental + 2nd harmonic + 3rd harmonic
      const harmonics = [1, 2, 3.02, 4.04];
      harmonics.forEach((mult, index) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = index === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(hz * mult, now);

        const volume = (0.08 / (index + 1));
        oscGain.gain.setValueAtTime(volume, now);
        oscGain.gain.exponentialRampToValueAtTime(0.00001, now + 2.8 - index * 0.4);

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 3.5);
      });
    } else {
      // Discordant clashing frequencies (tritone & minor second dissonance)
      const dissonantFreqs = [hz, hz * 1.06, hz * 1.414];
      dissonantFreqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);

        oscGain.gain.setValueAtTime(0.04, now);
        oscGain.gain.exponentialRampToValueAtTime(0.00001, now + 1.8);

        // Lowpass filter to avoid harsh treble
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(550, now);

        osc.connect(oscGain);
        oscGain.connect(filter);
        filter.connect(masterGain);

        osc.start(now);
        osc.stop(now + 2.2);
      });
    }
  } catch {
    // Audio context may be restricted in non-interactive environment
  }
}

/**
 * Gentle ambient sound drone toggle (meditative hum)
 */
export function setAmbientDrone(hz: number, enabled: boolean) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Stop previous oscillators
    if (activeDroneGain) {
      activeDroneGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
      setTimeout(() => {
        activeOscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // Ignore
          }
        });
        activeOscillators = [];
        activeDroneGain = null;
      }, 900);
    }

    if (!enabled) return;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 1.5);
    gain.connect(ctx.destination);
    activeDroneGain = gain;

    const baseOsc = ctx.createOscillator();
    baseOsc.type = 'sine';
    baseOsc.frequency.setValueAtTime(hz, now);

    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(hz / 2, now);

    baseOsc.connect(gain);
    subOsc.connect(gain);

    baseOsc.start(now);
    subOsc.start(now);
    activeOscillators = [baseOsc, subOsc];
  } catch {
    // Audio context restriction safe
  }
}
