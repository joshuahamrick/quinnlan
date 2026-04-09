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
      <div className="relative flex items-center">
        {/* Left: SCHEDULE */}
        <div className="shrink-0">
          <span className="font-extrabold text-base tracking-[0.15em] uppercase">
            SCHEDULE
          </span>
        </div>

        {/* Center: Project Name - absolutely centered on the full bar */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <EditableText
              value={schedule.projectName}
              onChange={(v) => updateField('projectName', v)}
              placeholder="Project Name"
              className="text-white font-bold text-base [&_span]:text-white/60 [&_input]:text-center"
            />
          </div>
        </div>

        {/* Right: Date */}
        <div className="ml-auto shrink-0 text-right">
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
