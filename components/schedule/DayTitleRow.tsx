'use client';

import { useScheduleStore } from '@/lib/store';
import EditableText from './EditableText';

export default function DayTitleRow() {
  const { schedule, updateField } = useScheduleStore();

  return (
    <div className="border border-gray-300 border-t-0 px-4 py-2 text-center font-bold text-lg">
      <span>{schedule.projectName || 'Project Name'}</span>
      <span className="mx-3">|</span>
      <span>Day </span>
      <EditableText
        value={String(schedule.dayNumber)}
        onChange={(v) => updateField('dayNumber', parseInt(v) || 1)}
        placeholder="1"
        className="inline font-bold text-lg"
      />
      <span> of </span>
      <EditableText
        value={String(schedule.totalDays)}
        onChange={(v) => updateField('totalDays', parseInt(v) || 1)}
        placeholder="1"
        className="inline font-bold text-lg"
      />
    </div>
  );
}
