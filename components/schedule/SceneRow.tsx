'use client';

import { useRef } from 'react';
import { useScheduleStore } from '@/lib/store';
import type { SceneRow as SceneRowType } from '@/lib/types';
import EditableText from './EditableText';

interface SceneRowProps {
  row: SceneRowType;
}

export default function SceneRow({ row }: SceneRowProps) {
  const { updateRow, removeRow } = useScheduleStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      updateRow(row.id, { boardImages: [...row.boardImages, url] });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    const updated = row.boardImages.filter((_, i) => i !== index);
    updateRow(row.id, { boardImages: updated });
  };

  return (
    <div className="grid grid-cols-[10%_25%_20%_12%_25%_8%] border border-gray-300 border-t-0 text-xs group relative hover:bg-blue-50/30 transition-colors">
      {/* Time */}
      <div className="border-r border-gray-300 px-2 py-1">
        <EditableText
          value={row.timeStart}
          onChange={(v) => updateRow(row.id, { timeStart: v })}
          placeholder="Start"
          className="text-[11px] font-semibold"
        />
        <div className="text-[10px] text-gray-500">to</div>
        <EditableText
          value={row.timeEnd}
          onChange={(v) => updateRow(row.id, { timeEnd: v })}
          placeholder="End"
          className="text-[11px] font-semibold"
        />
      </div>

      {/* Description */}
      <div className="border-r border-gray-300 px-2 py-1">
        <EditableText
          value={row.description}
          onChange={(v) => updateRow(row.id, { description: v })}
          placeholder="Scene description"
          className="text-[11px]"
          multiline
        />
      </div>

      {/* Boards */}
      <div className="border-r border-gray-300 px-2 py-1">
        <div className="flex flex-wrap gap-1">
          {row.boardImages.map((img, i) => (
            <div key={i} className="relative group/img">
              <img
                src={img}
                alt={`Board ${i + 1}`}
                className="h-16 w-auto object-cover rounded"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3.5 h-3.5 text-[8px] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
              >
                x
              </button>
            </div>
          ))}
          <button
            onClick={() => fileRef.current?.click()}
            className="h-16 w-16 border border-dashed border-gray-400 rounded flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 text-lg"
          >
            +
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </div>

      {/* Talent */}
      <div className="border-r border-gray-300 px-2 py-1">
        <EditableText
          value={row.talent}
          onChange={(v) => updateRow(row.id, { talent: v })}
          placeholder="Talent"
          className="text-[11px]"
          multiline
        />
      </div>

      {/* Details / Notes */}
      <div className="border-r border-gray-300 px-2 py-1">
        <EditableText
          value={row.details}
          onChange={(v) => updateRow(row.id, { details: v })}
          placeholder="Camera, Art, Props..."
          className="text-[11px]"
          multiline
        />
      </div>

      {/* Allow */}
      <div className="px-2 py-1">
        <EditableText
          value={row.allowTime}
          onChange={(v) => updateRow(row.id, { allowTime: v })}
          placeholder="Time"
          className="text-[11px]"
        />
      </div>

      {/* Delete button */}
      <button
        onClick={() => removeRow(row.id)}
        className="absolute right-0.5 top-0.5 text-red-400 hover:text-red-600 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded px-1"
      >
        x
      </button>
    </div>
  );
}
