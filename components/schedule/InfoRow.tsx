'use client';

import { useScheduleStore } from '@/lib/store';
import type { InfoRow as InfoRowType } from '@/lib/types';
import EditableText from './EditableText';
import TimeInput from './TimeInput';

export default function InfoRow({ row }: { row: InfoRowType }) {
  const { updateRow, removeRow } = useScheduleStore();

  const timeDisplay = row.timeEnd
    ? `${row.timeStart} - ${row.timeEnd}`
    : row.timeStart;

  return (
    <div data-schedule-row className="grid grid-cols-[10%_90%] border border-gray-300 border-t-0 text-xs group/info relative">
      <div className="border-r border-gray-300 px-2 py-1 font-semibold flex items-center justify-center">
        <div className="flex items-center justify-center gap-1">
          <TimeInput
            value={row.timeStart}
            onChange={(v) => updateRow(row.id, { timeStart: v })}
            placeholder="Time"
            className="text-[11px] font-semibold"
          />
          {row.timeEnd ? (
            <>
              <span className="text-[11px]">-</span>
              <TimeInput
                value={row.timeEnd}
                onChange={(v) => updateRow(row.id, { timeEnd: v })}
                placeholder=""
                className="text-[11px] font-semibold"
              />
            </>
          ) : null}
        </div>
      </div>
      <div className="px-2 py-1 font-semibold flex items-center">
        <div className="flex-1">
          {row.isFirstShot ? (
            <span className="text-[11px] font-semibold">First Shot</span>
          ) : (
            <EditableText
              value={row.label}
              onChange={(v) => updateRow(row.id, { label: v })}
              placeholder="Label"
              className="text-[11px] font-semibold"
            />
          )}
        </div>
        {!row.isFirstShot && (
          <button
            onClick={() => removeRow(row.id)}
            className="opacity-0 group-hover/info:opacity-100 transition-opacity text-red-400 hover:text-red-600 text-xs ml-2"
            data-export-hide
          >
            x
          </button>
        )}
      </div>
    </div>
  );
}
