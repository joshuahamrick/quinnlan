'use client';

import { useEffect, useState } from 'react';
import { useScheduleStore } from '@/lib/store';
import { extractColorsFromImage } from '@/lib/colors';
import { ColorPicker } from '@/components/ColorPicker';

export default function ColorThemePanel() {
  const { schedule, setThemeColor, setWrapColor, setTaillightsColor } = useScheduleStore();
  const [extractedColors, setExtractedColors] = useState<string[]>([]);

  // Extract colors from all uploaded logos
  useEffect(() => {
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

      // Combine and deduplicate
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
  }, [schedule.logos]);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">Color Theme</h3>

      {extractedColors.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Colors extracted from logos — click a swatch to apply
        </p>
      )}

      <ColorPicker
        label="Theme Color"
        value={schedule.themeColor}
        onChange={setThemeColor}
        swatches={extractedColors}
      />

      <ColorPicker
        label="Wrap Color"
        value={schedule.wrapColor}
        onChange={setWrapColor}
        swatches={extractedColors}
      />

      <ColorPicker
        label="Taillights Color"
        value={schedule.taillightsColor}
        onChange={setTaillightsColor}
        swatches={extractedColors}
      />
    </div>
  );
}
