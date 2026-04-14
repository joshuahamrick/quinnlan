'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useScheduleStore } from '@/lib/store';
import { compressImage } from '@/lib/images';
import { calculateDuration, calculateEndTime } from '@/lib/time-utils';
import type { SceneRow as SceneRowType } from '@/lib/types';
import EditableText from './EditableText';
import TimeInput from './TimeInput';
import DurationInput from './DurationInput';

interface SceneRowProps {
  row: SceneRowType;
  startTimeReadOnly?: boolean;
}

export default function SceneRow({ row, startTimeReadOnly }: SceneRowProps) {
  const { updateRow, removeRow } = useScheduleStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const boardIsDragging = useRef(false);
  const [boardDropActive, setBoardDropActive] = useState(false);

  const handleBoardDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBoardDropActive(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const raw = reader.result as string;
      const url = await compressImage(raw);
      updateRow(row.id, { boardImages: [...row.boardImages, url] });
    };
    reader.readAsDataURL(file);
  }, [row.id, row.boardImages, updateRow]);

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
    <div data-schedule-row className="grid grid-cols-[10%_25%_20%_12%_25%_8%] border border-gray-300 border-t-0 text-xs group relative hover:bg-blue-50/30 transition-colors">
      {/* Time */}
      <div className="border-r border-gray-300 px-2 py-1 flex flex-col justify-center">
        {startTimeReadOnly ? (
          <div className="text-[11px] font-semibold text-center text-black" title="Linked to First Shot">
            {row.timeStart || <span className="text-gray-400">Start</span>}
          </div>
        ) : (
          <TimeInput
            value={row.timeStart}
            onChange={(v) => {
              const duration = calculateDuration(v, row.timeEnd);
              updateRow(row.id, { timeStart: v, ...(duration ? { allowTime: duration } : {}) });
            }}
            placeholder="Start"
            className="text-[11px] font-semibold text-center"
            id={`start-${row.id}`}
            nextInputId={`end-${row.id}`}
          />
        )}
        <div className="text-[10px] text-gray-500 text-center">to</div>
        <TimeInput
          value={row.timeEnd}
          onChange={(v) => {
            const duration = calculateDuration(row.timeStart, v);
            updateRow(row.id, { timeEnd: v, ...(duration ? { allowTime: duration } : {}) });
          }}
          placeholder="End"
          className="text-[11px] font-semibold text-center"
          id={`end-${row.id}`}
        />
      </div>

      {/* Description */}
      <div className="border-r border-gray-300 px-2 py-1 flex flex-col justify-center">
        <EditableText
          value={row.description}
          onChange={(v) => updateRow(row.id, { description: v })}
          placeholder="Scene description"
          className="text-[11px]"
          multiline
        />
      </div>

      {/* Boards */}
      <div
        className={`border-r border-gray-300 px-2 py-1 relative group/boards cursor-pointer flex items-center justify-center ${boardDropActive ? 'border-2 border-dashed border-blue-400 bg-blue-50' : ''}`}
        onClick={() => { if (!boardIsDragging.current) fileRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setBoardDropActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setBoardDropActive(false); }}
        onDrop={handleBoardDrop}
      >
        {row.boardImages.length === 0 ? (
          <span className="text-[11px] text-gray-400 select-none" data-export-hide>Click to add boards</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {row.boardImages.map((img, i) => (
              <div key={i} className="relative group/img">
                <img
                  src={img}
                  alt={`Board ${i + 1}`}
                  className="w-auto object-cover rounded"
                  style={{ maxHeight: 80 * (row.boardScale ?? 1) }}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3.5 h-3.5 text-[8px] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          onClick={(e) => e.stopPropagation()}
        />
        <BoardResizeHandle rowId={row.id} isDraggingRef={boardIsDragging} />
      </div>

      {/* Talent */}
      <div className="border-r border-gray-300 px-2 py-1 flex flex-col justify-center items-center text-center">
        <EditableText
          value={row.talent}
          onChange={(v) => updateRow(row.id, { talent: v })}
          placeholder="Talent"
          className="text-[11px] [&_input]:text-center"
          multiline
        />
      </div>

      {/* Details / Notes */}
      <div className="border-r border-gray-300 px-2 py-1 flex flex-col justify-center items-center text-center">
        <EditableText
          value={row.details}
          onChange={(v) => updateRow(row.id, { details: v })}
          placeholder="Camera, Art, Props..."
          className="text-[11px] [&_input]:text-center"
          multiline
        />
      </div>

      {/* Allow */}
      <div className="px-2 py-1 flex flex-col justify-center items-center text-center">
        <DurationInput
          value={row.allowTime}
          onChange={(v) => {
            const newEnd = calculateEndTime(row.timeStart, v);
            updateRow(row.id, { allowTime: v, ...(newEnd ? { timeEnd: newEnd } : {}) });
          }}
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

function BoardResizeHandle({ rowId, isDraggingRef }: { rowId: string; isDraggingRef: React.MutableRefObject<boolean> }) {
  const updateRow = useScheduleStore((s) => s.updateRow);
  const dragState = useRef<{ startY: number; startScale: number } | null>(null);

  const updateRowRef = useRef(updateRow);
  updateRowRef.current = updateRow;

  const listenersRef = useRef<{ move: (e: MouseEvent) => void; up: (e: MouseEvent) => void } | null>(null);

  useEffect(() => {
    return () => {
      if (listenersRef.current) {
        window.removeEventListener('mousemove', listenersRef.current.move);
        window.removeEventListener('mouseup', listenersRef.current.up);
      }
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    isDraggingRef.current = true;
    const rows = useScheduleStore.getState().schedule.rows;
    const row = rows.find((r) => r.id === rowId);
    const currentScale = row && row.type === 'scene' ? (row.boardScale ?? 1) : 1;
    dragState.current = { startY: e.clientY, startScale: currentScale };

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragState.current) return;
      const deltaY = ev.clientY - dragState.current.startY;
      const newScale = Math.min(3.0, Math.max(0.3, dragState.current.startScale + deltaY * 0.005));
      updateRowRef.current(rowId, { boardScale: Math.round(newScale * 100) / 100 });
    };

    const onMouseUp = () => {
      dragState.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      listenersRef.current = null;
      // Delay clearing isDragging so the parent onClick (which fires after mouseup) is suppressed
      setTimeout(() => { isDraggingRef.current = false; }, 0);
    };

    if (listenersRef.current) {
      window.removeEventListener('mousemove', listenersRef.current.move);
      window.removeEventListener('mouseup', listenersRef.current.up);
    }
    listenersRef.current = { move: onMouseMove, up: onMouseUp };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [rowId, isDraggingRef]);

  return (
    <div
      className="absolute bottom-1 right-1 cursor-nwse-resize opacity-0 group-hover/boards:opacity-60 hover:!opacity-100 transition-opacity"
      data-export-hide
      onMouseDown={handleMouseDown}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        className="text-gray-400 select-none"
      >
        <path
          d="M11 1L1 11M11 5L5 11M11 9L9 11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
