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

function formatSunTime(timeStr: string): string {
  // Input: "6:45:23 AM" or "7:15:02 PM" from sunrise-sunset.org formatted=1
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2}):\d{2}\s*(AM|PM)$/i);
  if (!match) return timeStr;
  const hour = parseInt(match[1], 10);
  const minute = match[2];
  const period = match[3].toUpperCase() === 'AM' ? 'A' : 'P';
  return `${hour}:${minute}${period}`;
}

export async function fetchSunriseSunset(
  lat: number,
  lon: number,
  dateStr: string,
): Promise<{ sunrise: string; sunset: string } | null> {
  try {
    const res = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${dateStr}`,
    );
    const data = await res.json();
    if (data.status !== 'OK') return null;
    return {
      sunrise: formatSunTime(data.results.sunrise),
      sunset: formatSunTime(data.results.sunset),
    };
  } catch {
    return null;
  }
}

export async function fetchWeather(
  lat: number,
  lon: number,
  dateStr: string,
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`,
    );
    const data = await res.json();
    const code = data.daily?.weathercode?.[0];
    const temp = data.daily?.temperature_2m_max?.[0];
    if (code == null || temp == null) return null;
    const description = WEATHER_CODES[code] || 'Unknown';
    const tempF = Math.round(temp * 9 / 5 + 32);
    return `${description}, ${tempF}°F`;
  } catch {
    return null;
  }
}
