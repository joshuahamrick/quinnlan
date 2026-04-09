'use client';

import { useScheduleStore } from '@/lib/store';
import EditableText from './EditableText';

export default function HeaderBar() {
  const { schedule, updateField } = useScheduleStore();

  return (
    <div
      className="flex items-center justify-between px-4 py-2 text-white"
      style={{ backgroundColor: schedule.themeColor }}
    >
      <span className="font-bold text-lg tracking-wider">SCHEDULE</span>
      <span className="text-base font-semibold">
        <EditableText
          value={schedule.projectName}
          onChange={(v) => updateField('projectName', v)}
          placeholder="Project Name"
          className="text-white [&_span]:text-white/60"
        />
      </span>
      <span className="text-sm">
        <EditableText
          value={schedule.date}
          onChange={(v) => updateField('date', v)}
          placeholder="Date"
          className="text-white [&_span]:text-white/60"
        />
      </span>
    </div>
  );
}
