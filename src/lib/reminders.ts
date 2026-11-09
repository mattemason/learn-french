/**
 * Reminders without a push server (zero running cost):
 *  1. While the app is open or installed, a local notification fires at the
 *     chosen time if the learner hasn't practised today.
 *  2. A downloadable calendar file (.ics) with a daily repeating event works on
 *     every device, including iPhone, even when the app is closed.
 * True background push (Web Push) would need a server and is a future integration.
 */
import { useEffect } from 'react';
import { useStore } from '@/state/store';
import { dayKey } from './dates';

const FIRED_KEY = 'allez-reminder-fired';

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!notificationsSupported()) return 'unsupported';
  return Notification.requestPermission();
}

export function useReminders() {
  const reminders = useStore((s) => s.profile.reminders);
  useEffect(() => {
    if (!reminders.enabled || !notificationsSupported()) return;
    const tick = () => {
      if (Notification.permission !== 'granted') return;
      const now = new Date();
      const [h, m] = reminders.time.split(':').map(Number);
      const today = dayKey(now);
      let fired: string | null = null;
      try { fired = localStorage.getItem(FIRED_KEY); } catch { /* ignore */ }
      if (fired === today) return;
      if (now.getHours() * 60 + now.getMinutes() < h * 60 + m) return;
      const s = useStore.getState();
      if ((s.activity[today]?.xp ?? 0) > 0) return;
      try { localStorage.setItem(FIRED_KEY, today); } catch { /* ignore */ }
      new Notification('Allez ! 🇫🇷', { body: s.streak.current ? `Keep your ${s.streak.current}-day streak going — 5 minutes is enough.` : 'Five minutes of French today?', icon: '/icon.svg' });
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [reminders.enabled, reminders.time]);
}

export function downloadReminderIcs(time: string) {
  const [h, m] = time.split(':');
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Allez//Learn French//EN', 'BEGIN:VEVENT',
    `UID:allez-daily-${date}@allez.app`, `DTSTAMP:${date}T000000`, `DTSTART:${date}T${h}${m}00`, 'DURATION:PT10M',
    'RRULE:FREQ=DAILY', 'SUMMARY:French practice — Allez !', 'DESCRIPTION:Five minutes is enough. Progress over perfection.',
    'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:Time for French!', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  downloadFile('allez-daily-reminder.ics', ics, 'text/calendar');
}

export function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
