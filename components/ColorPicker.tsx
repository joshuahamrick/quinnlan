'use client';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  swatches?: string[];
}

export function ColorPicker({ label, value, onChange, swatches }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {swatches && swatches.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {swatches.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className="size-6 rounded-full border-2 transition-shadow"
              style={{
                backgroundColor: color,
                borderColor: value === color ? 'white' : 'transparent',
                boxShadow: value === color ? `0 0 0 2px ${color}` : 'none',
              }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          className="h-7 w-20 rounded border border-border bg-background px-2 text-xs font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
