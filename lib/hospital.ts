const STATE_ABBREVIATIONS: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA',
  Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
  Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO',
  Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND',
  Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI',
  'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT',
  Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV',
  Wisconsin: 'WI', Wyoming: 'WY', 'District of Columbia': 'DC',
};

function abbreviateState(state: string): string {
  if (!state) return '';
  if (state.length === 2) return state.toUpperCase();
  return STATE_ABBREVIATIONS[state] ?? state;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildOverpassQuery(lat: number, lon: number, radiusMeters: number): string {
  return `[out:json][timeout:10];(node["amenity"="hospital"]["emergency"="yes"](around:${radiusMeters},${lat},${lon});way["amenity"="hospital"]["emergency"="yes"](around:${radiusMeters},${lat},${lon});relation["amenity"="hospital"]["emergency"="yes"](around:${radiusMeters},${lat},${lon}););out center body;`;
}

interface OverpassElement {
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function getElementCoords(el: OverpassElement): { lat: number; lon: number } | null {
  if (el.lat != null && el.lon != null) return { lat: el.lat, lon: el.lon };
  if (el.center?.lat != null && el.center?.lon != null) return { lat: el.center.lat, lon: el.center.lon };
  return null;
}

function formatAddress(tags: Record<string, string>): string {
  const parts: string[] = [];
  const number = tags['addr:housenumber'] ?? '';
  const street = tags['addr:street'] ?? '';
  if (number && street) parts.push(`${number} ${street}`);
  else if (street) parts.push(street);

  const city = tags['addr:city'] ?? '';
  if (city) parts.push(city);

  const state = abbreviateState(tags['addr:state'] ?? '');
  const postcode = tags['addr:postcode'] ?? '';
  if (state && postcode) parts.push(`${state} ${postcode}`);
  else if (state) parts.push(state);
  else if (postcode) parts.push(postcode);

  return parts.join(', ');
}

async function tryFetchPhone(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      { headers: { 'User-Agent': 'Quinnlan/1.0' } }
    );
    if (!res.ok) return '';
    const data = await res.json();
    return data?.extratags?.phone ?? data?.extratags?.['contact:phone'] ?? '';
  } catch {
    return '';
  }
}

async function fetchOverpass(lat: number, lon: number, radiusMeters: number, signal?: AbortSignal): Promise<OverpassElement[]> {
  const query = buildOverpassQuery(lat, lon, radiusMeters);
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const res = await fetch(url, signal ? { signal } : undefined);
  if (!res.ok) return [];
  const data = await res.json();
  return data?.elements ?? [];
}

export async function fetchNearestER(lat: number, lon: number, signal?: AbortSignal): Promise<{
  name: string;
  address: string;
  phone: string;
  department: string;
} | null> {
  let elements = await fetchOverpass(lat, lon, 15000, signal);
  if (elements.length === 0) {
    elements = await fetchOverpass(lat, lon, 30000, signal);
  }
  if (elements.length === 0) return null;

  // Find closest hospital
  let closest: OverpassElement | null = null;
  let closestDist = Infinity;
  for (const el of elements) {
    const coords = getElementCoords(el);
    if (!coords || !el.tags?.name) continue;
    const dist = haversineDistance(lat, lon, coords.lat, coords.lon);
    if (dist < closestDist) {
      closestDist = dist;
      closest = el;
    }
  }
  if (!closest?.tags) return null;

  const tags = closest.tags;
  let phone = tags.phone ?? tags['contact:phone'] ?? '';

  if (!phone) {
    const coords = getElementCoords(closest);
    if (coords) {
      phone = await tryFetchPhone(coords.lat, coords.lon);
    }
  }

  return {
    name: tags.name ?? '',
    address: formatAddress(tags),
    phone,
    department: 'Emergency Room',
  };
}
