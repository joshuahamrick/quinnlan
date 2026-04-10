'use client';

import { useState, useRef, useEffect } from 'react';
import { useScheduleStore } from '@/lib/store';
import { extractColorsFromImage } from '@/lib/colors';
import EditableText from './EditableText';

const PRESET_COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#e94560', '#e2b714', '#cc0000', '#2d6a4f',
  '#264653', '#e76f51', '#f4a261', '#2a9d8f',
  '#023047', '#8338ec', '#fb5607',
];

export default function QuickRefBar() {
  const { schedule, addQuickRefEntry, removeQuickRefEntry, updateQuickRefEntry, updateField } = useScheduleStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);

  const effectiveColor = schedule.quickRefColor || schedule.themeColor;

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

  // Close color picker on outside click
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

  const handleBarClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('input, button, [contenteditable], span[class*="cursor-pointer"]')) return;
    setShowColorPicker((prev) => !prev);
  };

  const selectColor = (color: string) => {
    updateField('quickRefColor', color);
    setShowColorPicker(false);
  };

  return (
    <div
      data-schedule-row
      className="relative flex items-center justify-center px-4 py-1.5 text-white text-xs font-bold tracking-wide cursor-pointer"
      style={{ backgroundColor: effectiveColor }}
      onClick={handleBarClick}
    >
      <div className="flex items-center justify-center gap-2">
        {(schedule.quickRefEntries || []).map((entry, index) => (
          <div key={entry.id} className="group flex items-center gap-1">
            {index > 0 && <span className="mx-1 text-white/50">|</span>}
            <EditableText
              value={entry.label}
              onChange={(v) => updateQuickRefEntry(entry.id, { label: v })}
              placeholder="Label"
              className="text-white font-bold [&_span]:text-white/60"
            />
            <span>:</span>
            <EditableText
              value={entry.time}
              onChange={(v) => updateQuickRefEntry(entry.id, { time: v })}
              placeholder="Time"
              className="text-white font-bold [&_span]:text-white/60"
            />
            <button
              data-export-hide
              onClick={() => removeQuickRefEntry(entry.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 text-white/60 hover:text-white text-xs leading-none"
              title="Remove entry"
            >
              ×
            </button>
          </div>
        ))}
        <button
          data-export-hide
          onClick={addQuickRefEntry}
          className="ml-1 text-white/60 hover:text-white text-sm leading-none"
          title="Add entry"
        >
          +
        </button>
      </div>

      {/* Color picker popup */}
      {showColorPicker && (
        <div
          ref={pickerRef}
          data-export-hide
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 w-56 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Reset to theme */}
          {schedule.quickRefColor && (
            <button
              onClick={() => { updateField('quickRefColor', ''); setShowColorPicker(false); }}
              className="mb-2 w-full text-left text-[10px] font-medium text-blue-600 hover:text-blue-800"
            >
              Reset to theme color
            </button>
          )}

          {/* Extracted logo colors */}
          {extractedColors.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-medium text-gray-500 mb-1">From logos</p>
              <div className="flex flex-wrap gap-1">
                {extractedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => selectColor(color)}
                    className="size-5 rounded-full border-2 transition-shadow"
                    style={{
                      backgroundColor: color,
                      borderColor: effectiveColor === color ? 'black' : 'transparent',
                      boxShadow: effectiveColor === color ? `0 0 0 2px ${color}` : 'none',
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
                    borderColor: effectiveColor === color ? 'black' : 'transparent',
                    boxShadow: effectiveColor === color ? `0 0 0 2px ${color}` : 'none',
                  }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Custom color input */}
          <div>
            <p className="text-[10px] font-medium text-gray-500 mb-1">Custom</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={effectiveColor}
                onChange={(e) => updateField('quickRefColor', e.target.value)}
                className="h-7 w-10 cursor-pointer rounded border border-gray-200 bg-transparent p-0.5"
              />
              <input
                type="text"
                value={effectiveColor}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) updateField('quickRefColor', v);
                }}
                className="h-7 w-20 rounded border border-gray-200 bg-white px-2 text-xs font-mono text-gray-700"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
