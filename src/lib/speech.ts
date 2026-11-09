/**
 * Free, on-device audio using the Web Speech API.
 * - Text-to-speech with a French voice (works on iOS Safari, Chrome, Edge…).
 * - Speech recognition where supported (Chrome/Edge/Safari); otherwise callers fall back to self-rating.
 */

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const fr = voices.filter((v) => v.lang.toLowerCase().startsWith('fr'));
  const pref = ['Amélie', 'Thomas', 'Audrey', 'Aurélie', 'Google français', 'Microsoft Denise', 'Microsoft Henri'];
  return (
    fr.find((v) => v.lang === 'fr-FR' && pref.some((p) => v.name.includes(p))) ??
    fr.find((v) => v.lang === 'fr-FR') ??
    fr[0] ??
    null
  );
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = pickVoice();
  };
}

export const ttsSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speak(text: string, opts: { slow?: boolean; onEnd?: () => void } = {}) {
  if (!ttsSupported()) {
    opts.onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (cachedVoice === undefined) cachedVoice = pickVoice();
  if (cachedVoice) u.voice = cachedVoice;
  u.lang = 'fr-FR';
  u.rate = opts.slow ? 0.6 : 0.92;
  u.onend = () => opts.onEnd?.();
  u.onerror = () => opts.onEnd?.();
  synth.speak(u);
}

export function stopSpeaking() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

type Recognition = any;

export function recognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function listenOnce(onResult: (alternatives: string[]) => void, onError: (msg: string) => void): () => void {
  const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!Ctor) {
    onError('Speech recognition is not available in this browser.');
    return () => {};
  }
  const rec: Recognition = new Ctor();
  rec.lang = 'fr-FR';
  rec.interimResults = false;
  rec.maxAlternatives = 5;
  rec.onresult = (e: any) => {
    const alts: string[] = [];
    for (let i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript);
    onResult(alts);
  };
  rec.onerror = (e: any) => onError(e.error === 'not-allowed' ? 'Microphone permission was denied.' : 'Could not hear that — try again.');
  rec.start();
  return () => {
    try {
      rec.abort();
    } catch {
      /* ignore */
    }
  };
}
