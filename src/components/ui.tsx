import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders into <body>. Needed for position:fixed bars and dialogs, because
 * pages use transform-based entry animations, and a transformed ancestor
 * would otherwise become the containing block for fixed elements.
 */
export function Portal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}
import { Volume2, Snail, X } from 'lucide-react';
import { speak } from '@/lib/speech';
import { shopById } from '@/lib/game';

export function ProgressBar({ value, className = '', color = 'bg-primary', height = 'h-3' }: { value: number; className?: string; color?: string; height?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`w-full ${height} rounded-full bg-surface-2 overflow-hidden ${className}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${color} transition-[width] duration-500 ease-out relative`} style={{ width: `${pct}%` }}>
        <div className="absolute inset-x-2 top-[2px] h-[30%] rounded-full bg-white/30" />
      </div>
    </div>
  );
}

export function Ring({ value, size = 56, stroke = 6, children, color = 'rgb(var(--primary))' }: { value: number; size?: number; stroke?: number; children?: ReactNode; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgb(var(--surface-2))" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: 'stroke-dashoffset .6s ease-out' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function AudioButton({ text, size = 'md', autoPlay = false, label }: { text: string; size?: 'sm' | 'md' | 'lg'; autoPlay?: boolean; label?: string }) {
  const [playing, setPlaying] = useState(false);
  const play = (slow = false) => {
    setPlaying(true);
    speak(text, { slow, onEnd: () => setPlaying(false) });
  };
  useEffect(() => {
    if (autoPlay) {
      const t = setTimeout(() => play(), 250);
      return () => clearTimeout(t);
    }
  }, [text, autoPlay]); // eslint-disable-line react-hooks/exhaustive-deps
  const dims = size === 'lg' ? 'h-20 w-20' : size === 'sm' ? 'h-9 w-9' : 'h-12 w-12';
  const icon = size === 'lg' ? 34 : size === 'sm' ? 16 : 22;
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={() => play()} aria-label={label ?? `Play audio: ${text}`}
        className={`${dims} rounded-2xl bg-sky text-white grid place-items-center shadow-[0_4px_0_rgb(0_0_0/0.2)] active:translate-y-[3px] active:shadow-none transition ${playing ? 'animate-pulse' : ''}`}>
        <Volume2 size={icon} />
      </button>
      {size !== 'sm' && (
        <button type="button" onClick={() => play(true)} aria-label="Play slowly"
          className="h-9 w-9 rounded-xl bg-surface-2 text-ink-soft grid place-items-center active:translate-y-[2px]">
          <Snail size={16} />
        </button>
      )}
    </span>
  );
}

export function Avatar({ avatarId, frameId, size = 44 }: { avatarId: string; frameId: string; size?: number }) {
  const emoji = shopById.get(avatarId)?.preview ?? '🥐';
  const frame = shopById.get(frameId)?.preview ?? 'none';
  const ring =
    frame === 'gold' ? 'linear-gradient(135deg,#f6d365,#c99a2e,#fff1b8,#c99a2e)'
    : frame === 'tricolore' ? 'conic-gradient(#1f4fd1 0 33%, #ffffff 0 66%, #e8343f 0)'
    : frame === 'rainbow' ? 'conic-gradient(#ff6b6b,#ffd93d,#6bcb77,#4d96ff,#c77dff,#ff6b6b)'
    : 'rgb(var(--line))';
  return (
    <div className="rounded-full p-[3px] shrink-0" style={{ background: ring, width: size, height: size }}>
      <div className="w-full h-full rounded-full bg-surface-2 grid place-items-center" style={{ fontSize: size * 0.5 }}>{emoji}</div>
    </div>
  );
}

export function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  if (!open) return null;
  return (
    <Portal>
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 animate-[rise_.2s_ease-out]" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[88dvh] overflow-y-auto bg-surface rounded-t-4xl sm:rounded-4xl p-5 pb-8 safe-bottom animate-rise">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="h-10 w-10 grid place-items-center rounded-xl bg-surface-2"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
    </Portal>
  );
}

export function Stat({ icon, value, label, tone = 'text-ink' }: { icon: ReactNode; value: ReactNode; label: string; tone?: string }) {
  return (
    <div className="card p-3 flex items-center gap-3">
      <div className="text-2xl">{icon}</div>
      <div className="min-w-0">
        <div className={`text-lg font-black leading-tight ${tone}`}>{value}</div>
        <div className="text-xs font-bold text-ink-soft truncate">{label}</div>
      </div>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mt-7 mb-3">
      <h2 className="text-xl font-bold">{children}</h2>
      {action}
    </div>
  );
}

/** Renders **bold** and newlines in short teaching text. */
export function RichText({ text, className = '' }: { text: string; className?: string }) {
  const lines = text.split('\n');
  return (
    <div className={`prose-lite space-y-2 ${className}`}>
      {lines.map((line, i) => (
        <p key={i}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : <span key={j}>{part}</span>,
          )}
        </p>
      ))}
    </div>
  );
}

export function Empty({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return (
    <div className="card p-6 text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="font-display text-lg font-bold">{title}</div>
      {children && <div className="text-sm text-ink-soft mt-1">{children}</div>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <label className="flex items-center justify-between gap-4 py-3 cursor-pointer">
      <span>
        <span className="font-bold block">{label}</span>
        {description && <span className="text-sm text-ink-soft">{description}</span>}
      </span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-line'}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? 'left-7' : 'left-1'}`} />
      </button>
    </label>
  );
}
