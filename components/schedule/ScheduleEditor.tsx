'use client';

import { useState } from 'react';
import { useScheduleStore } from '@/lib/store';
import type { SceneRow as SceneRowType, ActionBarRow, ActionBarType } from '@/lib/types';
import HeaderBar from './HeaderBar';
import InfoGrid from './InfoGrid';
import VersionBar from './VersionBar';
import QuickRefBar from './QuickRefBar';
import ColumnHeaders from './ColumnHeaders';
import CrewCallRow from './CrewCallRow';
import DayTitleRow from './DayTitleRow';
import SceneRow from './SceneRow';
import ActionBar from './ActionBar';

export default function ScheduleEditor() {
  const { schedule, insertRowAfter, addRow } = useScheduleStore();
  const [insertMenuId, setInsertMenuId] = useState<string | null>(null);

  const createSceneRow = (): SceneRowType => ({
    id: crypto.randomUUID(),
    type: 'scene',
    timeStart: '',
    timeEnd: '',
    description: '',
    boardImages: [],
    talent: '',
    details: '',
    allowTime: '',
  });

  const createActionRow = (): ActionBarRow => ({
    id: crypto.randomUUID(),
    type: 'action',
    timeStart: '',
    timeEnd: '',
    label: '',
    actionType: 'custom' as ActionBarType,
    allowTime: '',
  });

  const handleInsert = (afterId: string, type: 'scene' | 'action') => {
    const row = type === 'scene' ? createSceneRow() : createActionRow();
    insertRowAfter(afterId, row);
    setInsertMenuId(null);
  };

  const handleAddToEnd = (type: 'scene' | 'action') => {
    const row = type === 'scene' ? createSceneRow() : createActionRow();
    addRow(row);
    setInsertMenuId(null);
  };

  return (
    <div className="max-w-[1100px] mx-auto bg-white shadow-sm" id="schedule-content">
      <HeaderBar />
      <InfoGrid />
      <VersionBar />
      <QuickRefBar />
      <ColumnHeaders />
      <CrewCallRow />
      <DayTitleRow />

      {schedule.rows.map((row) => (
        <div key={row.id}>
          {row.type === 'scene' ? (
            <SceneRow row={row as SceneRowType} />
          ) : (
            <ActionBar row={row as ActionBarRow} />
          )}

          {/* Insert button between rows */}
          <div className="relative h-0 group/insert">
            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/insert:opacity-100 transition-opacity">
              <button
                onClick={() =>
                  setInsertMenuId(insertMenuId === row.id ? null : row.id)
                }
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow"
              >
                +
              </button>
              {insertMenuId === row.id && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white border border-gray-300 rounded shadow-lg z-20 whitespace-nowrap">
                  <button
                    onClick={() => handleInsert(row.id, 'scene')}
                    className="block w-full px-3 py-1.5 text-xs hover:bg-gray-100 text-left"
                  >
                    Scene Row
                  </button>
                  <button
                    onClick={() => handleInsert(row.id, 'action')}
                    className="block w-full px-3 py-1.5 text-xs hover:bg-gray-100 text-left"
                  >
                    Action Bar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Add row at bottom */}
      <div className="border border-gray-300 border-t-0 px-4 py-2 flex items-center justify-center gap-2 relative">
        <button
          onClick={() =>
            setInsertMenuId(insertMenuId === '__end' ? null : '__end')
          }
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center shadow"
        >
          +
        </button>
        {insertMenuId === '__end' && (
          <div className="absolute top-10 bg-white border border-gray-300 rounded shadow-lg z-20 whitespace-nowrap">
            <button
              onClick={() => handleAddToEnd('scene')}
              className="block w-full px-3 py-1.5 text-xs hover:bg-gray-100 text-left"
            >
              Scene Row
            </button>
            <button
              onClick={() => handleAddToEnd('action')}
              className="block w-full px-3 py-1.5 text-xs hover:bg-gray-100 text-left"
            >
              Action Bar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
