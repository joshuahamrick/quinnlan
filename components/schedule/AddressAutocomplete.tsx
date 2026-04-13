'use client';

import { useState, useEffect, useRef } from 'react';

interface NominatimAddress {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
  amenity?: string;
  building?: string;
  shop?: string;
  tourism?: string;
  leisure?: string;
  office?: string;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  address?: NominatimAddress;
}

const STATE_ABBREVIATIONS: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC',
};

function getStateAbbreviation(state: string): string {
  return STATE_ABBREVIATIONS[state] || '';
}

function getEstablishmentName(result: NominatimResult): string {
  const addr = result.address || {};
  const road = addr.road || '';
  const houseNumber = addr.house_number || '';

  const name = result.name ||
    addr.amenity || addr.building || addr.shop ||
    addr.tourism || addr.leisure || addr.office || '';

  if (!name) return '';
  if (name === road || name === houseNumber || name === `${houseNumber} ${road}`) return '';

  return name;
}

function formatShortAddress(result: NominatimResult): string {
  const addr = result.address || {};
  const parts: string[] = [];

  const establishmentName = getEstablishmentName(result);
  if (establishmentName) parts.push(establishmentName);

  const street = [addr.house_number, addr.road].filter(Boolean).join(' ');
  if (street) parts.push(street);

  const city = addr.city || addr.town || addr.village || addr.hamlet || '';
  if (city) parts.push(city);

  const state = addr.state || '';
  const zip = addr.postcode || '';
  const stateAbbrev = getStateAbbreviation(state);
  if (stateAbbrev && zip) {
    parts.push(`${stateAbbrev} ${zip}`);
  } else if (stateAbbrev) {
    parts.push(stateAbbrev);
  } else if (state && zip) {
    parts.push(`${state} ${zip}`);
  } else if (state) {
    parts.push(state);
  }

  return parts.join(', ') || result.display_name;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onCoordinates?: (lat: number, lon: number) => void;
  placeholder?: string;
  className?: string;
}

export default function AddressAutocomplete({ value, onChange, onCoordinates, placeholder, className }: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLocalEdit = useRef(false);

  // Sync external value changes (skip when the change originated from local typing)
  useEffect(() => {
    if (!isLocalEdit.current) {
      setQuery(value);
    }
    isLocalEdit.current = false;
  }, [value]);

  // Debounced fetch
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
          { headers: { 'Accept': 'application/json' } }
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setShowDropdown(data.length > 0);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          isLocalEdit.current = true;
          const val = e.target.value;
          setQuery(val);
          onChange(val);
          if (!val) {
            onCoordinates?.(0, 0);
          }
        }}
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true);
        }}
        placeholder={placeholder}
        className={className}
      />
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg rounded-md z-50 mt-1 max-h-48 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onMouseDown={(e) => {
                e.preventDefault();
                const formatted = formatShortAddress(s);
                setQuery(formatted);
                onChange(formatted);
                onCoordinates?.(parseFloat(s.lat), parseFloat(s.lon));
                setSuggestions([]);
                setShowDropdown(false);
              }}
            >
              {formatShortAddress(s)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
