import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SentimentType, AudioPayload } from '../types';

interface MicrophoneButtonProps {
  sentiment: SentimentType;
  isListening: boolean;
  isProcessing: boolean;
  onTranscript: (payload: AudioPayload | string) => void;
  onToggleListen: (active: boolean) => void;
  onOpenTextInput: () => void;
  onInterimText?: (interim: string) => void;
  onStatusChange?: (status: string) => void;
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  sentiment,
  isListening,
  isProcessing,
  onTranscript,
  onToggleListen,
  onOpenTextInput,
  onInterimText,
  onStatusChange,
}) => {
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptRef = useRef<string>('');
  const hasSpokenRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(isListening);
  const recognitionRestartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingSessionRef = useRef<number>(0);
  const isFinalizingRef = useRef<boolean>(false);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const clearRecognitionRestartTimer = useCallback(() => {
    if (recognitionRestartTimerRef.current !== null) {
      clearTimeout(recognitionRestartTimerRef.current);
      recognitionRestartTimerRef.current = null;
    }
  }, []);

  // Stop browser speech recognition and visual analysis, but leave MediaRecorder
  // running until concludeAndSend has requested its final data.
  const stopRecognitionAndAnalyser = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    clearRecognitionRestartTimer();

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      try {
        recognition.onend = null;
        recognition.stop();
      } catch {
        // It may already have ended.
      }
    }

    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }

    analyserRef.current = null;
    setAudioVolume(0);
  }, [clearRecognitionRestartTimer]);

  const stopAllAudioTracks = useCallback(() => {
    isListeningRef.current = false;
    stopRecognitionAndAnalyser();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // It may already be stopping.
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore tracks that are already stopped.
        }
      });
      streamRef.current = null;
    }
  }, [stopRecognitionAndAnalyser]);

  // Finalize only when the user clicks Stop (or when the component unmounts).
  const concludeAndSend = useCallback(() => {
    if (isFinalizingRef.current) return;
    isFinalizingRef.current = true;

    // Flip the ref before stopping recognition so onend cannot restart it.
    isListeningRef.current = false;
    clearRecognitionRestartTimer();

    if (silenceTimerRef.current !== null) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      try {
        recognition.onend = null;
        recognition.stop();
      } catch {
        // Recognition may already have stopped.
      }
    }

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setAudioVolume(0);

    onToggleListen(false);

    const recorder = mediaRecorderRef.current;

    const deliverRecordedAudio = () => {
      const mimeType = recorder?.mimeType || audioChunksRef.current[0]?.type || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

      if (audioBlob.size <= 200) {
        onStatusChange?.('No voice captured. Tap the mic and speak clearly.');
        return;
      }

      onStatusChange?.('Transcribing and categorizing voice resonance...');
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string | null)?.split(',')[1];
        if (base64) {
          onTranscript({ audio: base64, mimeType });
        } else {
          onStatusChange?.('Could not read the recorded audio. Tap the mic to try again.');
        }
      };
      reader.onerror = () => {
        onStatusChange?.('Could not process the recorded audio. Tap the mic to try again.');
      };
      reader.readAsDataURL(audioBlob);
    };

    const finalize = () => {
      // Prefer the complete live transcript when available; otherwise send audio.
      const finalTranscript = transcriptRef.current.trim();
      if (finalTranscript) {
        onStatusChange?.('Analyzing words of intention...');
        onTranscript(finalTranscript);
      } else {
        deliverRecordedAudio();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      mediaRecorderRef.current = null;
    };

    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = finalize;
      try {
        recorder.stop();
      } catch (error) {
        console.warn('Failed to stop media recorder:', error);
        finalize();
      }
    } else {
      finalize();
    }
  }, [
    clearRecognitionRestartTimer,
    onStatusChange,
    onToggleListen,
    onTranscript,
  ]);

  const startListening = async () => {
    if (isProcessing || isListeningRef.current) return;

    setMicErrorMessage(null);
    transcriptRef.current = '';
    hasSpokenRef.current = false;
    audioChunksRef.current = [];
    isFinalizingRef.current = false;
    recordingSessionRef.current += 1;
    const sessionId = recordingSessionRef.current;

    onStatusChange?.('Requesting microphone access...');

    let stream: MediaStream;
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser context.');
      }

      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // If the component/session changed while permission was pending, release the stream.
      if (sessionId !== recordingSessionRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
    } catch (err: any) {
      console.warn('Microphone permission error:', err);
      let message = 'Microphone access denied. Please allow microphone access in your browser.';
      if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        message = 'No microphone device was found on your system.';
      } else if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        message = 'Microphone permission is blocked. Allow it using the icon beside the browser address bar.';
      }
      setMicErrorMessage(message);
      onStatusChange?.(message);
      return;
    }

    isListeningRef.current = true;
    onToggleListen(true);
    onStatusChange?.('Listening… Speak at your own pace. Click Stop when you are finished.');

    // Set up the live audio-level visualizer. Silence never stops the session.
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        const audioCtx: AudioContext = new AudioCtxClass();
        audioCtxRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.4;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkVolume = () => {
          if (
            !isListeningRef.current ||
            sessionId !== recordingSessionRef.current ||
            !analyserRef.current
          ) {
            return;
          }

          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i += 1) sum += dataArray[i];

          setAudioVolume(Math.min(1, (sum / Math.max(1, dataArray.length)) / 60));
          animFrameRef.current = requestAnimationFrame(checkVolume);
        };

        animFrameRef.current = requestAnimationFrame(checkVolume);
      }
    } catch (error) {
      console.warn('Audio analyzer initialization skipped:', error);
    }

    // Record the full session continuously until the user clicks Stop.
    try {
      if (typeof MediaRecorder !== 'undefined') {
        let mimeType = '';
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }

        const recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);

        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (event: BlobEvent) => {
          if (event.data?.size > 0) audioChunksRef.current.push(event.data);
        };
        recorder.start(250);
      }
    } catch (error) {
      console.warn('MediaRecorder could not start:', error);
      onStatusChange?.('Audio recording could not start. Live speech recognition may still work.');
    }

    // Speech recognition can end by itself in some browsers. Restart it while
    // the user is still listening; do not restart after the Stop button is clicked.
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognitionRef.current = recognition;

        let accumulated = '';

        recognition.onresult = (event: any) => {
          if (!isListeningRef.current || sessionId !== recordingSessionRef.current) return;

          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const result = event.results[i];
            if (result.isFinal) {
              accumulated += `${result[0].transcript} `;
            } else {
              interim += result[0].transcript;
            }
          }

          const combined = `${accumulated}${interim}`.trim();
          if (combined) {
            transcriptRef.current = combined;
            hasSpokenRef.current = true;
            onInterimText?.(combined);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition status:', event.error);
          // Some errors are terminal (e.g. permission denied). Do not loop on them.
          if (
            event.error === 'not-allowed' ||
            event.error === 'service-not-allowed' ||
            event.error === 'audio-capture'
          ) {
            clearRecognitionRestartTimer();
            onStatusChange?.(
              'Live speech recognition was interrupted. Audio recording will continue until you click Stop.',
            );
          }
        };

        recognition.onend = () => {
          if (
            !isListeningRef.current ||
            sessionId !== recordingSessionRef.current ||
            recognitionRef.current !== recognition
          ) {
            return;
          }

          clearRecognitionRestartTimer();
          recognitionRestartTimerRef.current = setTimeout(() => {
            recognitionRestartTimerRef.current = null;

            if (
              !isListeningRef.current ||
              sessionId !== recordingSessionRef.current ||
              recognitionRef.current !== recognition
            ) {
              return;
            }

            try {
              recognition.start();
            } catch (error) {
              // A start attempt can fail while the browser is transitioning.
              console.debug('Speech recognition restart deferred:', error);
            }
          }, 300);
        };

        try {
          recognition.start();
        } catch (error) {
          console.warn('SpeechRecognition could not start:', error);
          onStatusChange?.('Listening to audio. Live transcript is unavailable in this browser.');
        }
      } catch (error) {
        console.warn('SpeechRecognition initialization failed:', error);
        onStatusChange?.('Listening to audio. Live transcript is unavailable in this browser.');
      }
    } else {
      onStatusChange?.('Listening… Click Stop when finished. For live transcription, use a supported browser.');
    }
  };

  const handleMicClick = () => {
    if (isProcessing) return;

    if (isListeningRef.current || isListening) {
      concludeAndSend();
    } else {
      void startListening();
    }
  };

  useEffect(() => {
    return () => {
      // Unmount cleanup must not leave a restart timer or microphone active.
      recordingSessionRef.current += 1;
      isListeningRef.current = false;
      clearRecognitionRestartTimer();

      if (silenceTimerRef.current !== null) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      stopAllAudioTracks();
    };
  }, [clearRecognitionRestartTimer, stopAllAudioTracks]);

  const getButtonBg = () => {
    if (isProcessing) return 'bg-[#0b1f4d] animate-pulse';

    // Gratitude: deep golden yellow
    if (sentiment === 'positive') {
      return isListening
        ? 'bg-[#11326B] scale-105'
        : 'bg-[#11326B] hover:bg-[#0E4773]';
    }

    // Dissonance: dark brown
    if (sentiment === 'negative') {
      return isListening
        ? 'bg-[#5C3828] scale-105'
        : 'bg-[#5C3828] hover:bg-[#43291E]';
    }

    // Equilibrium: dark navy blue (default)
    return isListening
      ? 'bg-[#155B8A] scale-105'
      : 'bg-[#155B8A] hover:bg-[#0E4773]';
  };

  const getRingColor = () => {
    if (sentiment === 'positive') return 'bg-blue-500';
    if (sentiment === 'negative') return 'bg-amber-900';
    return 'bg-sky-400';
  };

  const dynamicScale = Math.min(1.6, 1 + audioVolume * 0.75);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Expanding ripple rings responding to voice volume */}
      <div
        className={`absolute w-28 h-28 rounded-full pointer-events-none transition-all duration-300 ${getRingColor()} ${
          isListening ? 'opacity-30' : 'scale-100 opacity-15'
        }`}
        style={{
          transform: isListening ? `scale(${dynamicScale * 1.3})` : undefined,
        }}
      />
      <div
        className={`absolute w-36 h-36 rounded-full pointer-events-none transition-all duration-500 ${getRingColor()} ${
          isListening ? 'opacity-20' : 'scale-100 opacity-10'
        }`}
        style={{
          transform: isListening ? `scale(${dynamicScale * 1.6})` : undefined,
        }}
      />

      {/* Main microphone / stop button */}
      <button
        type="button"
        onClick={handleMicClick}
        disabled={isProcessing}
        aria-label={isListening ? 'Stop listening and analyze speech' : 'Start listening'}
        className={`relative z-10 w-16 h-16 rounded-full text-[#fcf9f4] shadow-xl active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer group ${getButtonBg()}`}
        title={isListening ? 'Click to stop and analyze' : 'Click to start speaking'}
      >
        {isProcessing ? (
          <span className="material-symbols-outlined text-2xl animate-spin">
            progress_activity
          </span>
        ) : isListening ? (
          <span className="material-symbols-outlined text-2xl">stop</span>
        ) : (
          <span className="material-symbols-outlined text-2xl transition-transform group-hover:scale-110">
            mic
          </span>
        )}
      </button>

      {/* Auxiliary keyboard button for direct text affirmations */}
      <button
        type="button"
        onClick={onOpenTextInput}
        aria-label="Type affirmation manually"
        className="absolute -right-12 top-3 w-8 h-8 rounded-full bg-[#f0ede9]/80 backdrop-blur-md hover:bg-[#e5e2dd] border border-white/60 text-[#434843] flex items-center justify-center transition-all shadow-xs cursor-pointer group"
        title="Type affirmation text manually"
      >
        <span className="material-symbols-outlined text-sm group-hover:scale-110">edit</span>
      </button>

      {micErrorMessage && (
        <div className="absolute top-20 w-64 p-2 bg-red-50 border border-red-200 text-red-800 rounded-xl text-[11px] text-center shadow-md z-30 animate-fade-in">
          {micErrorMessage}
        </div>
      )}
    </div>
  );
};