'use client';

import { useState, useEffect, useRef } from 'react';
import { useScheduleStore } from '@/lib/store';
import { useFormatting } from '@/lib/formatting-context';
import { extractColorsFromImage } from '@/lib/colors';

const FONT_OPTIONS = [
  'Nunito',
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Lato',
];

const PRESET_COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#e94560', '#e2b714', '#cc0000', '#2d6a4f',
  '#264653', '#e76f51', '#f4a261', '#2a9d8f',
];

type ColorTarget = 'theme';

export default function FormattingToolbar() {
  const { schedule, updateField, setThemeColor } = useScheduleStore();
  const { applyFormatting, isActive } = useFormatting();

  const [fontOpen, setFontOpen] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<ColorTarget | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);

  const fontRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Extract colors from logos
  useEffect(() => {
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
  }, [schedule.logos]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (fontRef.current && !fontRef.current.contains(e.target as Node)) {
        setFontOpen(false);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setActiveColorPicker(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getColorValue = () => schedule.themeColor;
  const getColorLabel = () => 'Theme';
  const setColorValue = (_target: ColorTarget, color: string) => setThemeColor(color);

  const handleFontChange = (font: string) => {
    updateField('fontFamily', font);
    setFontOpen(false);
  };

  return (
    <div
      data-export-hide
      className="flex items-center gap-1 border-b border-gray-200 px-4 py-1.5 bg-[#f8f9fa]"
    >
      {/* Font selector */}
      <div ref={fontRef} className="relative">
        <button
          onClick={() => setFontOpen(!fontOpen)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200 rounded transition-colors min-w-[100px]"
          style={{ fontFamily: schedule.fontFamily || 'Nunito' }}
        >
          <span className="truncate">{schedule.fontFamily || 'Nunito'}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0 text-gray-400">
            <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {fontOpen && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font}
                onClick={() => handleFontChange(font)}
                className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 transition-colors ${
                  schedule.fontFamily === font ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="h-5 w-px bg-gray-300 mx-1" />

      {/* Text formatting buttons */}
      <button
        onMouseDown={(e) => { e.preventDefault(); applyFormatting('bold'); }}
        disabled={!isActive}
        className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
          isActive ? 'text-gray-700 hover:bg-gray-200' : 'text-gray-300 cursor-default'
        }`}
        title="Bold (**text**)"
      >
        B
      </button>
      <button
        onMouseDown={(e) => { e.preventDefault(); applyFormatting('italic'); }}
        disabled={!isActive}
        className={`px-2 py-1 text-xs italic rounded transition-colors ${
          isActive ? 'text-gray-700 hover:bg-gray-200' : 'text-gray-300 cursor-default'
        }`}
        title="Italic (*text*)"
      >
        I
      </button>
      <button
        onMouseDown={(e) => { e.preventDefault(); applyFormatting('bullet'); }}
        disabled={!isActive}
        className={`px-2 py-1 text-xs rounded transition-colors ${
          isActive ? 'text-gray-700 hover:bg-gray-200' : 'text-gray-300 cursor-default'
        }`}
        title="Bullet point"
      >
        •
      </button>

      {/* Separator */}
      <div className="h-5 w-px bg-gray-300 mx-1" />

      {/* Theme color control */}
      <div ref={activeColorPicker === 'theme' ? colorPickerRef : undefined} className="relative">
        <button
          onClick={() => setActiveColorPicker(activeColorPicker === 'theme' ? null : 'theme')}
          className="flex items-center gap-1.5 px-1.5 py-1 hover:bg-gray-200 rounded transition-colors"
          title={`${getColorLabel()} Color`}
        >
          <div
            className="size-5 rounded-full border border-gray-300"
            style={{ backgroundColor: getColorValue() }}
          />
          <span className="text-[10px] text-gray-500">{getColorLabel()}</span>
        </button>

        {activeColorPicker === 'theme' && (
          <div className="absolute top-full left-0 mt-1 z-50 w-52 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
            {/* Extracted logo colors */}
            {extractedColors.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-medium text-gray-500 mb-1">Logo Colors</p>
                <div className="flex flex-wrap gap-1">
                  {extractedColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setColorValue('theme', color)}
                      className="size-5 rounded-full border-2 transition-shadow"
                      style={{
                        backgroundColor: color,
                        borderColor: getColorValue() === color ? 'black' : 'transparent',
                        boxShadow: getColorValue() === color ? `0 0 0 2px ${color}` : 'none',
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
                    onClick={() => setColorValue('theme', color)}
                    className="size-5 rounded-full border-2 transition-shadow"
                    style={{
                      backgroundColor: color,
                      borderColor: getColorValue() === color ? 'black' : 'transparent',
                      boxShadow: getColorValue() === color ? `0 0 0 2px ${color}` : 'none',
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
                  value={getColorValue()}
                  onChange={(e) => setColorValue('theme', e.target.value)}
                  className="h-7 w-10 cursor-pointer rounded border border-gray-200 bg-transparent p-0.5"
                />
                <input
                  type="text"
                  value={getColorValue()}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setColorValue('theme', v);
                  }}
                  className="h-7 w-20 rounded border border-gray-200 bg-white px-2 text-xs font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
