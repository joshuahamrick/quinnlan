const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEATHER_CODES: Record<number, string> = {
  0: 'Clear Sky',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Drizzle',
  53: 'Drizzle',
  55: 'Drizzle',
  61: 'Rain',
  63: 'Rain',
  65: 'Rain',
  71: 'Snow',
  73: 'Snow',
  75: 'Snow',
  80: 'Rain Showers',
  81: 'Rain Showers',
  82: 'Rain Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm',
  99: 'Thunderstorm',
};

/**
 * Parse a schedule date string like "Thursday, March 19th" into "YYYY-MM-DD".
 * Assumes the current year (or next year if the date has already passed).
 */
export function parseScheduleDate(dateStr: string): string | null {
  const match = dateStr.match(/^\w+,\s+(\w+)\s+(\d+)(?:st|nd|rd|th)$/);
  if (!match) return null;
  const monthIndex = MONTHS.indexOf(match[1]);
  if (monthIndex === -1) return null;
  const day = parseInt(match[2], 10);
  const now = new Date();
  let year = now.getFullYear();
  // If the date is in the past, assume next year
  const candidate = new Date(year, monthIndex, day);
  if (candidate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    year++;
  }
  const mm = String(monthIndex + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function formatSunTime(isoTime: string): string {
  // Input: "2026-04-13T06:28" → "6:28A", "2026-04-13T19:32" → "7:32P"
  const match = isoTime.match(/T(\d{2}):(\d{2})$/);
  if (!match) return isoTime;
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const period = hour >= 12 ? 'P' : 'A';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minute}${period}`;
}

export async function fetchWeatherData(
  lat: number,
  lon: number,
  dateStr: string,
): Promise<{ sunrise: string; sunset: string; weather: string } | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset,weathercode,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`,
    );
    const data = await res.json();
    const daily = data.daily;
    if (!daily) return null;
    const sunrise = daily.sunrise?.[0];
    const sunset = daily.sunset?.[0];
    const code = daily.weathercode?.[0];
    const high = daily.temperature_2m_max?.[0];
    const low = daily.temperature_2m_min?.[0];
    if (!sunrise || !sunset || code == null || high == null || low == null) return null;
    const description = WEATHER_CODES[code] || 'Unknown';
    return {
      sunrise: formatSunTime(sunrise),
      sunset: formatSunTime(sunset),
      weather: `${description}\nHigh ${Math.round(high)}°F / Low ${Math.round(low)}°F`,
    };
  } catch {
    return null;
  }
}
