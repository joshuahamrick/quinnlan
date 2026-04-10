'use client';

import { useScheduleStore } from '@/lib/store';
import EditableText from './EditableText';

export default function QuickRefBar() {
  const { schedule, addQuickRefEntry, removeQuickRefEntry, updateQuickRefEntry } = useScheduleStore();

  return (
    <div
      data-schedule-row
      className="flex items-center justify-center px-4 py-1.5 text-white text-xs font-bold tracking-wide"
      style={{ backgroundColor: schedule.themeColor }}
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
    </div>
  );
}
