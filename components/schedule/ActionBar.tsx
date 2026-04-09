'use client';

import { useScheduleStore } from '@/lib/store';
import type { ActionBarRow } from '@/lib/types';
import EditableText from './EditableText';

interface ActionBarProps {
  row: ActionBarRow;
}

export default function ActionBar({ row }: ActionBarProps) {
  const { schedule, updateRow, removeRow } = useScheduleStore();

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

  return (
    <div
      className="border border-gray-300 border-t-0 text-xs text-white font-bold group relative"
      style={{ backgroundColor: getBackgroundColor() }}
    >
      <div className="flex items-center px-2 py-1">
        {/* Time range - left, fixed width */}
        <div className="w-[100px] shrink-0 flex items-center">
          <EditableText
            value={row.timeStart}
            onChange={(v) => updateRow(row.id, { timeStart: v })}
            placeholder="Start"
            className="text-white text-[11px] [&_span]:text-white/60"
          />
          {(row.timeStart || row.timeEnd) && <span className="mx-0.5">-</span>}
          <EditableText
            value={row.timeEnd}
            onChange={(v) => updateRow(row.id, { timeEnd: v })}
            placeholder="End"
            className="text-white text-[11px] [&_span]:text-white/60"
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
