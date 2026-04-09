'use client';

import { useScheduleStore } from '@/lib/store';
import EditableText from './EditableText';

export default function VersionBar() {
  const { schedule, updateField } = useScheduleStore();

  return (
    <div className="border border-gray-300 border-t-0 px-4 py-1 text-center text-xs font-bold bg-gray-100">
      <span>SCHEDULE VERSION </span>
      <EditableText
        value={String(schedule.version)}
        onChange={(v) => updateField('version', parseInt(v) || 1)}
        placeholder="1"
        className="inline text-xs font-bold"
      />
      {schedule.versionNotes && (
        <>
          <span className="mx-2">|</span>
          <EditableText
            value={schedule.versionNotes}
            onChange={(v) => updateField('versionNotes', v)}
            placeholder="Version notes"
            className="text-xs font-normal"
          />
        </>
      )}
      {!schedule.versionNotes && (
        <EditableText
          value=""
          onChange={(v) => updateField('versionNotes', v)}
          placeholder="Add version notes..."
          className="text-xs font-normal ml-2"
        />
      )}
    </div>
  );
}
