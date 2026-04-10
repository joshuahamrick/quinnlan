'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useScheduleStore } from '@/lib/store';

function InlineNumberEdit({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const save = useCallback(() => {
    setEditing(false);
    const parsed = parseInt(draft) || 1;
    if (parsed !== value) onChange(parsed);
  }, [draft, value, onChange]);

  if (!editing) {
    return (
      <span
        className="cursor-pointer hover:bg-blue-50 px-0.5 rounded transition-colors"
        onClick={() => setEditing(true)}
      >
        {value}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') { setEditing(false); setDraft(String(value)); }
      }}
      className="border border-blue-400 rounded px-0.5 py-0 text-lg font-bold outline-none text-center w-8 inline-block"
    />
  );
}

export default function DayTitleRow() {
  const { schedule, updateField } = useScheduleStore();

  return (
    <div data-schedule-row className="border border-gray-300 border-t-0 px-4 py-2 text-center font-bold text-lg">
      <span>{schedule.projectName || 'Project Name'}</span>
      <span className="mx-3 font-normal">|</span>
      <span>Day </span>
      <InlineNumberEdit
        value={schedule.dayNumber}
        onChange={(v) => updateField('dayNumber', v)}
      />
      <span> of </span>
      <InlineNumberEdit
        value={schedule.totalDays}
        onChange={(v) => updateField('totalDays', v)}
      />
    </div>
  );
}
