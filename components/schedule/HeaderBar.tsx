'use client';

import { useScheduleStore } from '@/lib/store';
import EditableText from './EditableText';

export default function HeaderBar() {
  const { schedule, updateField } = useScheduleStore();

  return (
    <div
      className="relative px-4 py-2 text-white"
      style={{ backgroundColor: schedule.themeColor }}
    >
      {/* Use a table-like layout for true centering */}
      <div className="flex items-center">
        {/* Left: SCHEDULE - fixed width */}
        <div className="w-[120px] shrink-0">
          <span className="font-extrabold text-base tracking-[0.15em] uppercase">
            SCHEDULE
          </span>
        </div>

        {/* Center: Project Name - takes remaining space, text-center */}
        <div className="flex-1 text-center">
          <span className="text-white/50 mr-2">|</span>
          <EditableText
            value={schedule.projectName}
            onChange={(v) => updateField('projectName', v)}
            placeholder="Project Name"
            className="text-white font-bold text-base [&_span]:text-white/60 [&_input]:text-center"
          />
          <span className="text-white/50 ml-2">|</span>
        </div>

        {/* Right: Date - fixed width */}
        <div className="w-[220px] shrink-0 text-right">
          <EditableText
            value={schedule.date}
            onChange={(v) => updateField('date', v)}
            placeholder="Day, Date"
            className="text-white font-bold text-sm [&_span]:text-white/60 [&_input]:text-right"
          />
        </div>
      </div>
    </div>
  );
}
