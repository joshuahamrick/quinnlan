'use client';

import { useEffect, useRef, useState } from 'react';
import { useScheduleStore } from '@/lib/store';
import { extractColorsFromImage } from '@/lib/colors';
import { calculateDuration } from '@/lib/time-utils';
import type { ActionBarRow } from '@/lib/types';
import EditableText from './EditableText';
import TimeInput from './TimeInput';

interface ActionBarProps {
  row: ActionBarRow;
}

const PRESET_COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#e94560', '#e2b714', '#cc0000', '#2d6a4f',
  '#264653', '#e76f51', '#f4a261', '#2a9d8f',
];

export default function ActionBar({ row }: ActionBarProps) {
  const { schedule, updateRow, removeRow } = useScheduleStore();
  const [pickerOpen, setPickerOpen] = useState(false);
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

  const getDefaultColor = () => {
    switch (row.actionType) {
      case 'wrap':
        return schedule.wrapColor;
      case 'taillights':
        return schedule.taillightsColor;
      default:
        return schedule.themeColor;
    }
  };

  // Extract colors from logos when picker opens
  useEffect(() => {
    if (!pickerOpen) return;

    const urls = schedule.logos
      .map((l) => l.url)
      .filter((url) => url.length > 0);

    if (urls.length === 0) {
      setExtractedColors([]);
      return;
    }

    let cancelled = false;

    async function extract() {
      const results = await Promise.all(urls.map(extractColorsFromImage));
      if (cancelled) return;

      const seen = new Set<string>();
      const combined: string[] = [];
      for (const palette of results) {
        for (const color of palette) {
          const lower = color.toLowerCase();
          if (!seen.has(lower)) {
            seen.add(lower);
            combined.push(color);
          }
        }
      }
      setExtractedColors(combined);
    }

    extract();
    return () => { cancelled = true; };
  }, [pickerOpen, schedule.logos]);

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;

    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [pickerOpen]);

  const pickColor = (color: string) => {
    updateRow(row.id, { color });
    setPickerOpen(false);
  };

  const resetColor = () => {
    updateRow(row.id, { color: undefined });
    setPickerOpen(false);
  };

  const currentColor = getBackgroundColor();

  return (
    <div
      data-schedule-row
      className="border border-gray-300 border-t-0 text-xs text-white font-bold group relative"
      style={{ backgroundColor: currentColor }}
    >
      <div className="flex items-center px-2 py-1">
        {/* Time range - left, fixed width */}
        <div className="w-[100px] shrink-0 flex items-center">
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

        {/* Label - center, truly centered between equal-width columns */}
        <div className="flex-1 text-center uppercase tracking-wider">
          <EditableText
            value={row.label}
            onChange={(v) => updateRow(row.id, { label: v })}
            placeholder="ACTION LABEL"
            className="text-white text-[11px] [&_span]:text-white/60 [&_input]:text-center"
          />
        </div>

        {/* Allow - right, fixed width matching left */}
        <div className="w-[100px] shrink-0 text-right">
          <EditableText
            value={row.allowTime}
            onChange={(v) => updateRow(row.id, { allowTime: v })}
            placeholder="Time"
            className="text-white text-[11px] [&_span]:text-white/60 [&_input]:text-right"
          />
        </div>
      </div>

      {/* Color swatch button */}
      <div ref={pickerRef} className="absolute right-5 top-0.5" data-export-hide>
        <button
          onClick={() => setPickerOpen(!pickerOpen)}
          className="size-4 rounded-full border-2 border-white/40 hover:border-white opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: currentColor }}
          aria-label="Change banner color"
        />

        {pickerOpen && (
          <div className="absolute right-0 top-5 z-50 w-52 rounded-lg border border-border bg-white p-3 shadow-lg">
            {/* Theme color */}
            <div className="mb-2">
              <p className="text-[10px] font-medium text-gray-500 mb-1">Theme</p>
              <button
                onClick={() => pickColor(getDefaultColor())}
                className="size-6 rounded-full border-2 transition-shadow"
                style={{
                  backgroundColor: getDefaultColor(),
                  borderColor: currentColor === getDefaultColor() && !row.color ? 'black' : 'transparent',
                  boxShadow: currentColor === getDefaultColor() && !row.color ? `0 0 0 2px ${getDefaultColor()}` : 'none',
                }}
                aria-label="Theme color"
              />
            </div>

            {/* Extracted logo colors */}
            {extractedColors.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-medium text-gray-500 mb-1">From logos</p>
                <div className="flex flex-wrap gap-1">
                  {extractedColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => pickColor(color)}
                      className="size-5 rounded-full border-2 transition-shadow"
                      style={{
                        backgroundColor: color,
                        borderColor: row.color === color ? 'black' : 'transparent',
                        boxShadow: row.color === color ? `0 0 0 2px ${color}` : 'none',
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
                    onClick={() => pickColor(color)}
                    className="size-5 rounded-full border-2 transition-shadow"
                    style={{
                      backgroundColor: color,
                      borderColor: row.color === color ? 'black' : 'transparent',
                      boxShadow: row.color === color ? `0 0 0 2px ${color}` : 'none',
                    }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Custom color input */}
            <div className="mb-2">
              <p className="text-[10px] font-medium text-gray-500 mb-1">Custom</p>
              <input
                type="color"
                value={currentColor}
                onChange={(e) => updateRow(row.id, { color: e.target.value })}
                className="h-7 w-full cursor-pointer rounded border border-gray-200 bg-transparent p-0.5"
              />
            </div>

            {/* Reset button */}
            {row.color && (
              <button
                onClick={resetColor}
                className="w-full text-[10px] text-gray-500 hover:text-gray-800 border border-gray-200 rounded px-2 py-1 transition-colors"
              >
                Reset to theme
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={() => removeRow(row.id)}
        className="absolute right-0.5 top-0.5 text-white/60 hover:text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
        data-export-hide
      >
        x
      </button>
    </div>
  );
}
