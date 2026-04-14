'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface DurationInputProps {
  value: string; // e.g., "1hr 30mins", "45mins", "2hrs"
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  variant?: 'light' | 'dark';
}

function parseDuration(value: string): { hours: string; minutes: string } {
  const s = value.trim().toLowerCase();
  if (!s) return { hours: '', minutes: '' };

  const hrMatch = s.match(/(\d+)\s*hrs?/);
  const minMatch = s.match(/(\d+)\s*mins?/);

  const hours = hrMatch ? hrMatch[1] : '';
  const minutes = minMatch ? minMatch[1] : '';

  return { hours, minutes };
}

function formatDuration(h: string, m: string): string {
  const hours = parseInt(h, 10) || 0;
  const minutes = parseInt(m, 10) || 0;
  if (hours === 0 && minutes === 0) return '';

  const hrLabel = hours === 1 ? 'hr' : 'hrs';
  const minLabel = 'mins';

  if (hours === 0) return `${minutes}${minLabel}`;
  if (minutes === 0) return `${hours}${hrLabel}`;
  return `${hours}${hrLabel} ${minutes}${minLabel}`;
}

export default function DurationInput({ value, onChange, placeholder, className = '', variant = 'light' }: DurationInputProps) {
  const parsed = parseDuration(value);
  const [hours, setHours] = useState(parsed.hours);
  const [minutes, setMinutes] = useState(parsed.minutes);
  const [focused, setFocused] = useState(false);

  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastEmittedRef = useRef(value);

  // Sync from prop when value changes externally
  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    const p = parseDuration(value);
    setHours(p.hours);
    setMinutes(p.minutes);
    lastEmittedRef.current = value;
  }, [value]);

  const emit = useCallback((h: string, m: string) => {
    const formatted = formatDuration(h, m);
    if (formatted !== value) {
      lastEmittedRef.current = formatted;
      onChange(formatted);
    }
  }, [value, onChange]);

  const handleFocus = () => setFocused(true);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    const related = e.relatedTarget as Node | null;
    if (containerRef.current && related && containerRef.current.contains(related)) return;
    setFocused(false);
    // Pad minutes on blur
    const paddedMin = minutes ? minutes.padStart(2, '0') : minutes;
    if (paddedMin !== minutes) setMinutes(paddedMin);
    emit(hours, paddedMin || minutes);
  }, [hours, minutes, emit]);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 2);
    const num = parseInt(v, 10);
    if (v && (num < 0 || num > 23)) return;
    setHours(v);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 2);
    const num = parseInt(v, 10);
    if (v.length === 2 && (num < 0 || num > 59)) return;
    setMinutes(v);
  };

  const handleHoursKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      minutesRef.current?.focus();
    } else if (e.key === 'Escape') {
      hoursRef.current?.blur();
    }
  };

  const handleMinutesKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      hoursRef.current?.focus();
    } else if (e.key === 'Escape') {
      minutesRef.current?.blur();
    }
  };

  const hasValue = !!value;

  const inputClasses = variant === 'dark'
    ? 'bg-transparent text-white border-white/40 focus:border-white'
    : 'bg-gray-50/50 text-inherit border-gray-200 focus:border-blue-300 shadow-sm';

  const labelClasses = variant === 'dark'
    ? 'text-white/40 text-[9px]'
    : 'text-gray-400 text-[9px]';

  // Not focused, no value — show placeholder
  if (!focused && !hasValue) {
    return (
      <span
        tabIndex={0}
        className={`cursor-pointer hover:bg-blue-50 px-0.5 rounded transition-colors block text-center ${className}`}
        onClick={() => {
          setFocused(true);
          setTimeout(() => hoursRef.current?.focus(), 0);
        }}
        onFocus={() => {
          setFocused(true);
          setTimeout(() => hoursRef.current?.focus(), 0);
        }}
      >
        <span className="text-gray-400 italic" data-export-hide>{placeholder || 'Time'}</span>
      </span>
    );
  }

  // Not focused, has value — display mode
  if (!focused && hasValue) {
    return (
      <span
        tabIndex={0}
        className={`cursor-pointer hover:bg-blue-50 px-0.5 rounded transition-colors block text-center ${className}`}
        onClick={() => {
          setFocused(true);
          setTimeout(() => hoursRef.current?.focus(), 0);
        }}
        onFocus={() => {
          setFocused(true);
          setTimeout(() => hoursRef.current?.focus(), 0);
        }}
      >
        {value}
      </span>
    );
  }

  // Focused — edit mode
  return (
    <div
      ref={containerRef}
      className={`inline-flex items-center justify-center gap-0.5 ${className}`}
      onBlur={handleBlur}
    >
      <input
        ref={hoursRef}
        type="text"
        inputMode="numeric"
        value={hours}
        onChange={handleHoursChange}
        onFocus={(e) => { handleFocus(); e.target.select(); }}
        onKeyDown={handleHoursKeyDown}
        placeholder="H"
        className={`w-[1.8em] text-center border rounded-lg rounded-r-none px-1 py-1.5 outline-none transition-colors ${inputClasses}`}
        style={{ fontSize: 'inherit' }}
      />
      <span className={`select-none ${labelClasses}`}>hr</span>
      <input
        ref={minutesRef}
        type="text"
        inputMode="numeric"
        value={minutes}
        onChange={handleMinutesChange}
        onFocus={(e) => { handleFocus(); e.target.select(); }}
        onKeyDown={handleMinutesKeyDown}
        placeholder="MM"
        className={`w-[2.2em] text-center border rounded-lg px-1 py-1.5 outline-none transition-colors ${inputClasses}`}
        style={{ fontSize: 'inherit' }}
      />
      <span className={`select-none ${labelClasses}`}>min</span>
    </div>
  );
}
