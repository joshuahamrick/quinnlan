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
  const decimal = parseFloat((hours + mins / 60).toFixed(1));
  return `${decimal}hrs`;
}
