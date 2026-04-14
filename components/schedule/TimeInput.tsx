'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface TimeInputProps {
  value: string; // e.g., "9:30A"
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string; // sets id on the hours input so other TimeInputs can focus it
  nextInputId?: string; // when Tab is pressed on period, focus element with this id
  variant?: 'light' | 'dark'; // 'dark' for colored backgrounds (banners)
}

function parseTimeValue(value: string): { hours: string; minutes: string; period: string } {
  const s = value.trim().toUpperCase();
  if (!s) return { hours: '', minutes: '', period: '' };

  const match = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(A|AM|P|PM)$/);
  if (!match) return { hours: '', minutes: '', period: '' };

  const hours = match[1];
  const minutes = match[2] ?? '00';
  const period = match[3][0]; // "A" or "P"

  return { hours, minutes, period };
}

export default function TimeInput({ value, onChange, placeholder, className = '', id, nextInputId, variant = 'light' }: TimeInputProps) {
  const parsed = parseTimeValue(value);
  const [hours, setHours] = useState(parsed.hours);
  const [minutes, setMinutes] = useState(parsed.minutes);
  const [period, setPeriod] = useState(parsed.period);
  const [focused, setFocused] = useState(false);

  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);
  const periodRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastEmittedRef = useRef(value);

  // Sync from prop — only when value changes from outside (not from our own emit)
  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    const p = parseTimeValue(value);
    setHours(p.hours);
    setMinutes(p.minutes);
    setPeriod(p.period);
    lastEmittedRef.current = value;
  }, [value]);

  const emit = useCallback((h: string, m: string, p: string) => {
    if (!h) {
      if (value) {
        lastEmittedRef.current = '';
        onChange('');
      }
      return;
    }
    if (h && p) {
      const mm = m ? m.padStart(2, '0') : '00';
      const formatted = `${h}:${mm}${p}`;
      if (formatted !== value) {
        lastEmittedRef.current = formatted;
        onChange(formatted);
      }
    }
  }, [value, onChange]);

  const handleFocus = () => setFocused(true);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Check if focus is moving to another element within the container
    const related = e.relatedTarget as Node | null;
    if (containerRef.current && related && containerRef.current.contains(related)) return;
    setFocused(false);
    // If no hours entered, reset all fields
    if (!hours) {
      setMinutes('');
      setPeriod('');
      emit(hours, '', '');
      return;
    }
    // Pad minutes on blur
    const paddedMin = minutes ? minutes.padStart(2, '0') : minutes;
    if (paddedMin !== minutes) setMinutes(paddedMin);
    // Default period to 'A' if user never explicitly set it
    const effectivePeriod = period || 'A';
    if (!period) setPeriod('A');
    emit(hours, paddedMin || minutes, effectivePeriod);
  }, [hours, minutes, period, emit]);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 2);
    const num = parseInt(v, 10);
    if (v && (num < 1 || num > 12)) return;
    setHours(v);
    // Auto-advance: if two digits entered or value > 1 (can't be prefix of 10/11/12)
    if (v.length === 2 || (v.length === 1 && num > 1)) {
      minutesRef.current?.focus();
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 2);
    const num = parseInt(v, 10);
    if (v.length === 2 && (num < 0 || num > 59)) return;
    setMinutes(v);
    if (v.length === 2) {
      periodRef.current?.focus();
    }
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
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      periodRef.current?.focus();
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      hoursRef.current?.focus();
    } else if (e.key === 'Escape') {
      minutesRef.current?.blur();
    }
  };

  const handlePeriodKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      setPeriod('A');
      emit(hours, minutes, 'A');
    } else if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      setPeriod('P');
      emit(hours, minutes, 'P');
    } else if (e.key === 'Tab' && !e.shiftKey && nextInputId) {
      e.preventDefault();
      const target = document.getElementById(nextInputId);
      if (target) {
        target.focus();
      }
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      minutesRef.current?.focus();
    } else if (e.key === 'Escape') {
      periodRef.current?.blur();
    }
  };

  const togglePeriod = () => {
    const next = period === 'A' ? 'P' : period === 'P' ? 'A' : 'A';
    setPeriod(next);
    emit(hours, minutes, next);
  };

  const hasValue = !!value;

  const inputClasses = variant === 'dark'
    ? 'bg-transparent text-white border-white/40 focus:border-white'
    : 'bg-gray-50/50 text-inherit border-gray-200 focus:border-blue-300 shadow-sm';

  const buttonClasses = variant === 'dark'
    ? 'bg-transparent text-white border-white/40 focus:border-white hover:bg-white/10'
    : 'bg-blue-50 text-blue-600 border-transparent focus:border-blue-300 hover:bg-blue-100';

  // When not focused and empty, show placeholder
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

  // When not focused and has value, show as plain text
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

  return (
    <div
      ref={containerRef}
      className={`inline-flex items-center justify-center gap-0.5 ${className}`}
      onBlur={handleBlur}
    >
      <input
        ref={hoursRef}
        id={id}
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
      <span className="text-gray-300 select-none font-light" style={{ fontSize: 'inherit' }}>:</span>
      <input
        ref={minutesRef}
        type="text"
        inputMode="numeric"
        value={minutes}
        onChange={handleMinutesChange}
        onFocus={(e) => { handleFocus(); e.target.select(); }}
        onKeyDown={handleMinutesKeyDown}
        placeholder="MM"
        className={`w-[2.2em] text-center border px-1 py-1.5 outline-none transition-colors ${inputClasses}`}
        style={{ fontSize: 'inherit' }}
      />
      <span className="w-0.5" />
      <button
        ref={periodRef}
        type="button"
        onClick={togglePeriod}
        onFocus={() => handleFocus()}
        onKeyDown={handlePeriodKeyDown}
        className={`w-[1.6em] text-center rounded-full px-0.5 py-1 outline-none cursor-pointer font-medium transition-colors ${buttonClasses}`}
        style={{ fontSize: 'inherit' }}
      >
        {period || 'A'}
      </button>
    </div>
  );
}
