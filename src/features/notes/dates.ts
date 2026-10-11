// Turning dates into the 'YYYY-MM-DD' day an entry is filed under, and into labels.

function pad(value: number) {
  return String(value).padStart(2, '0');
}

// The day in the phone's own timezone, e.g. '2026-10-11'.
export function localDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function dateFromDay(day: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
}

// "Today", "Yesterday", then e.g. "Thu, Oct 9" (with the year once it's not this year).
export function dayLabel(day: string, now = new Date()): string {
  if (day === localDay(now)) return 'Today';

  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (day === localDay(yesterday)) return 'Yesterday';

  const date = dateFromDay(day);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
}

// e.g. "9:41 AM".
export function timeLabel(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
