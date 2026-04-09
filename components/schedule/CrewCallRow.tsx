'use client';

import { useScheduleStore } from '@/lib/store';
import TimeInput from './TimeInput';

export default function CrewCallRow() {
  const { schedule, updateField } = useScheduleStore();

  return (
    <div className="grid grid-cols-[10%_90%] border border-gray-300 border-t-0 text-xs">
      <div className="border-r border-gray-300 px-2 py-1 font-semibold">
        <TimeInput
          value={schedule.crewCallTime}
          onChange={(v) => updateField('crewCallTime', v)}
          placeholder="Time"
          className="text-[11px] font-semibold"
        />
      </div>
      <div className="px-2 py-1 font-semibold">
        General Crew Call + Safety Meeting
      </div>
    </div>
  );
}
