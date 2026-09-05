/**
 * useSpeech -- Web Speech API hook for MediKiosk kiosk flow
 *
 * Provides:
 *   speak(text, lang)           -- TTS: reads text aloud in given language
 *   startListening(lang, cb, errCb) -- ASR: starts recognition, calls cb(transcript)
 *   stopListening()             -- stops active recognition
 *   isListening  {bool}
 *   isSpeaking   {bool}
 *   isSupported  { tts: bool, asr: bool }
 *
 * Language code mapping (BCP-47):
 *   English->en-IN, Hindi->hi-IN, Tamil->ta-IN, Bengali->bn-IN,
 *   Marathi->mr-IN, Telugu->te-IN, Kannada->kn-IN, Gujarati->gu-IN
 *
 * Swap note: Replace the bodies of speak() and startListening() to plug in
 * Bhashini / Sarvam / any cloud ASR-TTS without changing KioskFlow.jsx.
 */
import { useState, useRef, useCallback } from 'react';

export const LANGUAGE_CODES = {
  'English':  'en-IN',
  'Hindi':    'hi-IN',
  'Tamil':    'ta-IN',
  'Bengali':  'bn-IN',
  'Marathi':  'mr-IN',
  'Telugu':   'te-IN',
  'Kannada':  'kn-IN',
  'Gujarati': 'gu-IN',
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_CODES);

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  const isSupported = {
    tts: typeof window !== 'undefined' && 'speechSynthesis' in window,
    asr: typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
  };

  const speak = useCallback((text, lang = 'en-IN') => {
    if (!isSupported.tts || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGUAGE_CODES[lang] || lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart  = () => setIsSpeaking(true);
    utterance.onend    = () => setIsSpeaking(false);
    utterance.onerror  = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [isSupported.tts]);

  const stopSpeaking = useCallback(() => {
    if (isSupported.tts) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported.tts]);

  const startListening = useCallback((lang = 'en-IN', onResult, onError) => {
    if (!isSupported.asr) {
      if (onError) onError(new Error('Speech recognition not supported in this browser'));
      return;
    }
    if (recognitionRef.current) recognitionRef.current.abort();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = LANGUAGE_CODES[lang] || lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart  = () => setIsListening(true);
    recognition.onend    = () => setIsListening(false);
    recognition.onerror  = (e) => {
      setIsListening(false);
      if (onError) onError(new Error(e.error || 'Speech recognition error'));
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || '';
      if (onResult) onResult(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported.asr]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return { speak, stopSpeaking, startListening, stopListening, isListening, isSpeaking, isSupported };
}
