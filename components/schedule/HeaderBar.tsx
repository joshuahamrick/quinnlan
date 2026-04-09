'use client';

import { useScheduleStore } from '@/lib/store';
import EditableText from './EditableText';

export default function HeaderBar() {
  const { schedule, updateField } = useScheduleStore();

  return (
    <div
      className="grid grid-cols-[auto_1fr_auto] items-center px-4 py-2 text-white"
      style={{ backgroundColor: schedule.themeColor }}
    >
      {/* Left: SCHEDULE */}
      <span className="font-extrabold text-lg tracking-[0.15em] uppercase whitespace-nowrap">
        SCHEDULE
      </span>

      {/* Center: Project Name with pipe separators */}
      <div className="flex items-center justify-center gap-3 text-base font-bold">
        <span className="text-white/50">|</span>
        <EditableText
          value={schedule.projectName}
          onChange={(v) => updateField('projectName', v)}
          placeholder="Project Name"
          className="text-white font-bold [&_span]:text-white/60"
        />
        <span className="text-white/50">|</span>
      </div>

      {/* Right: Date */}
      <span className="text-sm font-bold whitespace-nowrap">
        <EditableText
          value={schedule.date}
          onChange={(v) => updateField('date', v)}
          placeholder="Day, Date"
          className="text-white font-bold [&_span]:text-white/60"
        />
      </span>
    </div>
  );
}
