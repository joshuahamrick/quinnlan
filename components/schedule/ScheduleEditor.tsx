'use client';

import { useState, useCallback } from 'react';
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
  const { schedule, insertRowAfter, addRow, reorderRows } = useScheduleStore();
  const [insertMenuId, setInsertMenuId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, rowId: string) => {
    setDraggedId(rowId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', rowId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetIndex(index);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, regularRows: { id: string }[]) => {
    e.preventDefault();
    if (draggedId == null || dropTargetIndex == null) return;

    const fromRow = schedule.rows.findIndex((r) => r.id === draggedId);
    // dropTargetIndex is the visual position in regularRows where we want to insert.
    // Map it back to the schedule.rows index.
    let toRow: number;
    if (dropTargetIndex >= regularRows.length) {
      // Dropping after the last regular row — find the index of the last regular row + 1
      const lastRegular = regularRows[regularRows.length - 1];
      toRow = schedule.rows.findIndex((r) => r.id === lastRegular.id) + 1;
    } else {
      toRow = schedule.rows.findIndex((r) => r.id === regularRows[dropTargetIndex].id);
    }

    if (fromRow !== -1 && toRow !== -1 && fromRow !== toRow) {
      // If moving down, adjust for the removal shifting indices
      const adjustedTo = fromRow < toRow ? toRow - 1 : toRow;
      reorderRows(fromRow, adjustedTo);
    }

    setDraggedId(null);
    setDropTargetIndex(null);
  }, [draggedId, dropTargetIndex, schedule.rows, reorderRows]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDropTargetIndex(null);
  }, []);

  const createSceneRow = (): SceneRowType => ({
    id: crypto.randomUUID(),
    type: 'scene',
    timeStart: '',
    timeEnd: '',
    description: '',
    boardImages: [],
    boardScale: 1,
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

      {(() => {
        const regularRows = schedule.rows.filter(
          (r) =>
            r.type !== 'action' ||
            ((r as ActionBarRow).actionType !== 'wrap' &&
              (r as ActionBarRow).actionType !== 'taillights')
        );
        const terminalRows = schedule.rows.filter(
          (r) =>
            r.type === 'action' &&
            ((r as ActionBarRow).actionType === 'wrap' ||
              (r as ActionBarRow).actionType === 'taillights')
        );

        return (
          <>
            {regularRows.map((row, index) => (
              <div key={row.id}>
                {/* Drop indicator above this row */}
                {draggedId != null && dropTargetIndex === index && draggedId !== row.id && (
                  <div className="h-0.5 bg-blue-500 mx-1" />
                )}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, row.id)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, regularRows)}
                  className={`relative group/row ${draggedId === row.id ? 'opacity-40' : ''}`}
                >
                  {/* Drag handle */}
                  <div
                    data-export-hide
                    className="absolute left-0 top-0 bottom-0 w-6 z-10 flex items-center justify-center cursor-grab opacity-0 group-hover/row:opacity-100 transition-opacity"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
                      <circle cx="5" cy="3" r="1.5" fill="currentColor" />
                      <circle cx="11" cy="3" r="1.5" fill="currentColor" />
                      <circle cx="5" cy="8" r="1.5" fill="currentColor" />
                      <circle cx="11" cy="8" r="1.5" fill="currentColor" />
                      <circle cx="5" cy="13" r="1.5" fill="currentColor" />
                      <circle cx="11" cy="13" r="1.5" fill="currentColor" />
                    </svg>
                  </div>
                  {row.type === 'scene' ? (
                    <SceneRow row={row as SceneRowType} />
                  ) : (
                    <ActionBar row={row as ActionBarRow} />
                  )}
                </div>

                {/* Drop indicator after last row */}
                {draggedId != null && index === regularRows.length - 1 && dropTargetIndex === regularRows.length && (
                  <div className="h-0.5 bg-blue-500 mx-1" />
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
                          Strip
                        </button>
                        <button
                          onClick={() => handleInsert(row.id, 'action')}
                          className="block w-full px-3 py-1.5 text-xs hover:bg-gray-100 text-left"
                        >
                          Banner
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add row button - inserts before terminal rows */}
            <div
              className="border border-gray-300 border-t-0 px-4 py-2 flex items-center justify-center gap-2 relative"
              data-export-hide
              onDragOver={(e) => handleDragOver(e, regularRows.length)}
              onDrop={(e) => handleDrop(e, regularRows)}
            >
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
                    Strip
                  </button>
                  <button
                    onClick={() => handleAddToEnd('action')}
                    className="block w-full px-3 py-1.5 text-xs hover:bg-gray-100 text-left"
                  >
                    Banner
                  </button>
                </div>
              )}
            </div>

            {/* Terminal rows (wrap + taillights) always at bottom */}
            {terminalRows.map((row) => (
              <div key={row.id}>
                <ActionBar row={row as ActionBarRow} />
              </div>
            ))}
          </>
        );
      })()}
    </div>
  );
}
