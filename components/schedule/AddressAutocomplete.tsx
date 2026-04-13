'use client';

import { useState, useEffect, useRef } from 'react';

interface NominatimResult {
  place_id: number;
  display_name: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AddressAutocomplete({ value, onChange, placeholder, className }: AddressAutocompleteProps) {
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
          setQuery(e.target.value);
          onChange(e.target.value);
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
                setQuery(s.display_name);
                onChange(s.display_name);
                setSuggestions([]);
                setShowDropdown(false);
              }}
            >
              {s.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
