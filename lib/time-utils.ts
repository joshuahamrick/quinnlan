/**
 * Parse a production-schedule time string into minutes since midnight.
 * Accepts formats like "9:00A", "9:00AM", "9:30A", "12:00P", "1:00P", "9A", "930A".
 * Returns null if unparseable.
 */
export function parseTime(timeStr: string): number | null {
  const s = timeStr.trim().toUpperCase();
  if (!s) return null;

  // Match: optional hours, optional colon, optional minutes, then A/AM/P/PM
  const match = s.match(/^(\d{1,2})(?::?(\d{2}))?\s*(A|AM|P|PM)$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3].startsWith('P') ? 'PM' : 'AM';

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;

  // Convert to 24-hour
  if (period === 'AM') {
    if (hours === 12) hours = 0; // 12:00A = midnight
  } else {
    if (hours !== 12) hours += 12; // 12:00P = noon stays 12
  }

  return hours * 60 + minutes;
}

/**
 * Auto-format a time input string for display consistency.
 * - Strips trailing M from AM/PM → just A or P
 * - Capitalizes a/p
 * - Inserts colon if missing between hours and minutes
 * - Returns original string if it can't be parsed
 *
 * Examples: "840am" → "8:40A", "1030p" → "10:30P", "9:00a" → "9:00A", "100P" → "1:00P"
 */
export function formatTimeInput(raw: string): string {
  const s = raw.trim();
  if (!s) return s;

  // Match digits (1-4) then optional colon then optional digits then A/AM/P/PM (case-insensitive)
  const match = s.match(/^(\d{1,4})(?::(\d{2}))?\s*(a|am|p|pm|A|AM|P|PM)$/);
  if (!match) return raw;

  const digits = match[1];
  let explicitMinutes = match[2]; // from "H:MM" format
  const periodRaw = match[3];

  let hours: number;
  let minutes: number;

  if (explicitMinutes != null) {
    // Already had a colon, e.g. "9:00a"
    hours = parseInt(digits, 10);
    minutes = parseInt(explicitMinutes, 10);
  } else if (digits.length <= 2) {
    // Just an hour, e.g. "9a" or "12p"
    hours = parseInt(digits, 10);
    minutes = 0;
  } else if (digits.length === 3) {
    // e.g. "840" → 8:40, "100" → 1:00
    hours = parseInt(digits[0], 10);
    minutes = parseInt(digits.slice(1), 10);
  } else {
    // e.g. "1030" → 10:30
    hours = parseInt(digits.slice(0, 2), 10);
    minutes = parseInt(digits.slice(2), 10);
  }

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return raw;

  const period = periodRaw[0].toUpperCase(); // "A" or "P"
  const mm = minutes.toString().padStart(2, '0');
  return `${hours}:${mm}${period}`;
}

/**
 * Calculate the duration between two production-schedule time strings.
 * Returns a formatted string like "30mins", "1hr", "1hr 30mins", "2hrs".
 * Returns empty string if either time is unparseable or end <= start.
 */
export function calculateDuration(startStr: string, endStr: string): string {
  const startMins = parseTime(startStr);
  const endMins = parseTime(endStr);

  if (startMins === null || endMins === null) return '';

  const diff = endMins - startMins;
  if (diff <= 0) return '';

  const hours = Math.floor(diff / 60);
  const mins = diff % 60;

  if (hours === 0) return `${mins}mins`;
  if (mins === 0) return hours === 1 ? '1hr' : `${hours}hrs`;
  const hrLabel = hours === 1 ? 'hr' : 'hrs';
  return `${hours}${hrLabel} ${mins}mins`;
}
