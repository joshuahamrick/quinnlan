'use client';

import { useScheduleStore } from '@/lib/store';
import EditableText from './EditableText';

export default function QuickRefBar() {
  const { schedule, updateField } = useScheduleStore();

  return (
    <div
      data-schedule-row
      className="flex items-center justify-center px-4 py-1.5 text-white text-xs font-bold tracking-wide"
      style={{ backgroundColor: schedule.themeColor }}
    >
      <div className="flex items-center justify-center gap-2">
        <span>Production:</span>
        <EditableText
          value={schedule.productionTime}
          onChange={(v) => updateField('productionTime', v)}
          placeholder="Time"
          className="text-white font-bold [&_span]:text-white/60"
        />
        <span className="mx-1 text-white/50">|</span>
        <span>General:</span>
        <EditableText
          value={schedule.generalTime}
          onChange={(v) => updateField('generalTime', v)}
          placeholder="Time"
          className="text-white font-bold [&_span]:text-white/60"
        />
        <span className="mx-1 text-white/50">|</span>
        <span>Artist:</span>
        <EditableText
          value={schedule.artistTime}
          onChange={(v) => updateField('artistTime', v)}
          placeholder="Time"
          className="text-white font-bold [&_span]:text-white/60"
        />
        <span className="mx-1 text-white/50">|</span>
        <span>Setup:</span>
        <EditableText
          value={schedule.setupTimeStart}
          onChange={(v) => updateField('setupTimeStart', v)}
          placeholder="Start"
          className="text-white font-bold [&_span]:text-white/60"
        />
        <span>-</span>
        <EditableText
          value={schedule.setupTimeEnd}
          onChange={(v) => updateField('setupTimeEnd', v)}
          placeholder="End"
          className="text-white font-bold [&_span]:text-white/60"
        />
      </div>
    </div>
  );
}
