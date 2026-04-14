'use client';

import { useState, useEffect, useRef } from 'react';
import { useScheduleStore } from '@/lib/store';
import { calculateDuration, calculateEndTime } from '@/lib/time-utils';
import { extractColorsFromImage } from '@/lib/colors';
import type { ActionBarRow } from '@/lib/types';
import EditableText from './EditableText';
import TimeInput from './TimeInput';
import DurationInput from './DurationInput';

const PRESET_COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#e94560', '#e2b714', '#cc0000', '#2d6a4f',
  '#264653', '#e76f51', '#f4a261', '#2a9d8f',
  '#023047', '#8338ec', '#fb5607',
];

interface ActionBarProps {
  row: ActionBarRow;
  startTimeReadOnly?: boolean;
}

export default function ActionBar({ row, startTimeReadOnly }: ActionBarProps) {
  const { schedule, updateRow, removeRow } = useScheduleStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);

  const getBackgroundColor = () => {
    if (row.color) return row.color;
    switch (row.actionType) {
      case 'wrap':
        return schedule.wrapColor;
      case 'taillights':
        return schedule.taillightsColor;
      default:
        return schedule.themeColor;
    }
  };

  const currentColor = getBackgroundColor();

  // Extract colors from logos when picker opens
  useEffect(() => {
    if (!showColorPicker) return;
    const urls = schedule.logos.map((l) => l.url).filter((url) => url.length > 0);
    if (urls.length === 0) { setExtractedColors([]); return; }

    let cancelled = false;
    async function extract() {
      const results = await Promise.all(urls.map(extractColorsFromImage));
      if (cancelled) return;
      const seen = new Set<string>();
      const combined: string[] = [];
      for (const palette of results) {
        for (const color of palette) {
          const lower = color.toLowerCase();
          if (!seen.has(lower)) { seen.add(lower); combined.push(color); }
        }
      }
      setExtractedColors(combined);
    }
    extract();
    return () => { cancelled = true; };
  }, [showColorPicker, schedule.logos]);

  // Close on outside click
  useEffect(() => {
    if (!showColorPicker) return;
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showColorPicker]);

  const handleBannerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('input, button, [contenteditable]')) return;
    setShowColorPicker((prev) => !prev);
  };

  const selectColor = (color: string) => {
    updateRow(row.id, { color });
    setShowColorPicker(false);
  };

  const resetToTheme = () => {
    updateRow(row.id, { color: undefined as unknown as string });
    setShowColorPicker(false);
  };

  return (
    <div
      data-schedule-row
      className="border border-gray-300 border-t-0 text-xs text-white font-bold group relative"
      style={{ backgroundColor: currentColor }}
      onClick={handleBannerClick}
    >
      <div className="flex items-center px-2 py-1">
        {/* Time range - left, fixed width */}
        <div className="w-[100px] shrink-0 flex items-center">
          {startTimeReadOnly ? (
            <span className="text-white text-[11px]">
              {row.timeStart || <span className="text-white/60">Start</span>}
            </span>
          ) : (
            <TimeInput
              value={row.timeStart}
              onChange={(v) => {
                const duration = calculateDuration(v, row.timeEnd);
                updateRow(row.id, { timeStart: v, ...(duration ? { allowTime: duration } : {}) });
              }}
              placeholder="Start"
              className="text-white text-[11px] [&_span]:text-white/60"
              id={`start-${row.id}`}
              nextInputId={`end-${row.id}`}
              variant="dark"
            />
          )}
          {(row.timeStart || row.timeEnd) && <span className="mx-0.5">-</span>}
          <TimeInput
            value={row.timeEnd}
            onChange={(v) => {
              const duration = calculateDuration(row.timeStart, v);
              updateRow(row.id, { timeEnd: v, ...(duration ? { allowTime: duration } : {}) });
            }}
            placeholder="End"
            className="text-white text-[11px] [&_span]:text-white/60"
            id={`end-${row.id}`}
            variant="dark"
          />
        </div>

        {/* Label - center */}
        <div className="flex-1 text-center uppercase tracking-wider">
          <EditableText
            value={row.label}
            onChange={(v) => updateRow(row.id, { label: v })}
            placeholder="ACTION LABEL"
            className="text-white text-[11px] [&_span]:text-white/60 [&_input]:text-center"
          />
        </div>

        {/* Allow - right, fixed width matching left */}
        <div className="w-[100px] shrink-0 flex justify-end">
          <DurationInput
            value={row.allowTime}
            onChange={(v) => {
              const newEnd = calculateEndTime(row.timeStart, v);
              updateRow(row.id, { allowTime: v, ...(newEnd ? { timeEnd: newEnd } : {}) });
            }}
            placeholder="Time"
            className="text-white text-[11px]"
            variant="dark"
          />
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => removeRow(row.id)}
        className="absolute right-0.5 top-0.5 text-white/60 hover:text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
        data-export-hide
      >
        x
      </button>

      {/* Color picker popup */}
      {showColorPicker && (
        <div
          ref={pickerRef}
          data-export-hide
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 w-56 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Extracted logo colors */}
          {extractedColors.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-medium text-gray-500 mb-1">Logo Colors</p>
              <div className="flex flex-wrap gap-1">
                {extractedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => selectColor(color)}
                    className="size-5 rounded-full border-2 transition-shadow"
                    style={{
                      backgroundColor: color,
                      borderColor: currentColor === color ? 'black' : 'transparent',
                      boxShadow: currentColor === color ? `0 0 0 2px ${color}` : 'none',
                    }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Preset colors */}
          <div className="mb-2">
            <p className="text-[10px] font-medium text-gray-500 mb-1">Presets</p>
            <div className="flex flex-wrap gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => selectColor(color)}
                  className="size-5 rounded-full border-2 transition-shadow"
                  style={{
                    backgroundColor: color,
                    borderColor: currentColor === color ? 'black' : 'transparent',
                    boxShadow: currentColor === color ? `0 0 0 2px ${color}` : 'none',
                  }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Custom color input */}
          <div className="mb-2">
            <p className="text-[10px] font-medium text-gray-500 mb-1">Custom</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => updateRow(row.id, { color: e.target.value })}
                className="h-7 w-10 cursor-pointer rounded border border-gray-200 bg-transparent p-0.5"
              />
              <input
                type="text"
                value={row.color ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) updateRow(row.id, { color: v });
                }}
                className="h-7 w-20 rounded border border-gray-200 bg-white px-2 text-xs font-mono text-gray-700"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Reset to theme */}
          <button
            onClick={resetToTheme}
            className="w-full text-[10px] text-gray-500 hover:text-gray-700 py-1 border-t border-gray-100 mt-1"
          >
            Reset to theme color
          </button>
        </div>
      )}
    </div>
  );
}
