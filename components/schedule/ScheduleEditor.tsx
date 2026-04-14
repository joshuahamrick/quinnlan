'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useScheduleStore } from '@/lib/store';
import { calculateDuration, calculateEndTime } from '@/lib/time-utils';
import type { SceneRow as SceneRowType, ActionBarRow, ActionBarType } from '@/lib/types';
import { useWeatherSync } from '@/lib/useWeatherSync';
import { useHospitalSync } from '@/lib/useHospitalSync';
import HeaderBar from './HeaderBar';
import InfoGrid from './InfoGrid';
import VersionBar from './VersionBar';
import QuickRefBar from './QuickRefBar';
import ColumnHeaders from './ColumnHeaders';
import CrewCallRow from './CrewCallRow';
import FirstShotRow from './FirstShotRow';
import DayTitleRow from './DayTitleRow';
import SceneRow from './SceneRow';
import ActionBar from './ActionBar';

function InsertMenu({
  menuId,
  insertMenuId,
  setInsertMenuId,
  onScene,
  onAction,
}: {
  menuId: string;
  insertMenuId: string | null;
  setInsertMenuId: (id: string | null) => void;
  onScene: () => void;
  onAction: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const isOpen = insertMenuId === menuId;
  const [showAbove, setShowAbove] = useState(false);

  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setShowAbove(window.innerHeight - rect.bottom < 100);
    }
  }, [isOpen]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setInsertMenuId(isOpen ? null : menuId)}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow"
      >
        +
      </button>
      {isOpen && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 bg-white border border-gray-300 rounded shadow-lg z-20 whitespace-nowrap ${
            showAbove ? 'bottom-8' : 'top-6'
          }`}
        >
          <button
            onClick={onScene}
            className="block w-full px-3 py-1.5 text-xs hover:bg-gray-100 text-left"
          >
            Strip
          </button>
          <button
            onClick={onAction}
            className="block w-full px-3 py-1.5 text-xs hover:bg-gray-100 text-left"
          >
            Banner
          </button>
        </div>
      )}
    </>
  );
}

function InsertMenuLarge({
  menuId,
  insertMenuId,
  setInsertMenuId,
  onScene,
  onAction,
}: {
  menuId: string;
  insertMenuId: string | null;
  setInsertMenuId: (id: string | null) => void;
  onScene: () => void;
  onAction: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const isOpen = insertMenuId === menuId;
  const [showAbove, setShowAbove] = useState(false);

  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setShowAbove(window.innerHeight - rect.bottom < 100);
    }
  }, [isOpen]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setInsertMenuId(isOpen ? null : menuId)}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center shadow"
      >
        +
      </button>
      {isOpen && (
        <div
          className={`absolute bg-white border border-gray-300 rounded shadow-lg z-20 whitespace-nowrap ${
            showAbove ? 'bottom-10' : 'top-10'
          }`}
        >
          <button
            onClick={onScene}
            className="block w-full px-3 py-1.5 text-xs hover:bg-gray-100 text-left"
          >
            Strip
          </button>
          <button
            onClick={onAction}
            className="block w-full px-3 py-1.5 text-xs hover:bg-gray-100 text-left"
          >
            Banner
          </button>
        </div>
      )}
    </>
  );
}

export default function ScheduleEditor() {
  useWeatherSync();
  useHospitalSync();
  const { schedule, insertRowAfter, addRow, reorderRows, updateRow, updateField } = useScheduleStore();
  const [insertMenuId, setInsertMenuId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [previewOrder, setPreviewOrder] = useState<string[] | null>(null);
  const [dragSection, setDragSection] = useState<'pre' | 'main' | null>(null);
  const wasDragging = useRef(false);

  // Sync First Shot time → first scene row's start time
  useEffect(() => {
    const firstScene = schedule.rows.find((r): r is SceneRowType => r.type === 'scene' && !r.preSchedule);
    if (firstScene && schedule.firstShotTime && firstScene.timeStart !== schedule.firstShotTime) {
      const newEnd = firstScene.allowTime
        ? calculateEndTime(schedule.firstShotTime, firstScene.allowTime)
        : firstScene.timeEnd || '';
      updateRow(firstScene.id, {
        timeStart: schedule.firstShotTime,
        ...(newEnd ? { timeEnd: newEnd } : {}),
      });
    }
  }, [schedule.firstShotTime, schedule.rows, updateRow]);

  // Cascade times: each row's start time = previous row's end time
  useEffect(() => {
    const rows = schedule.rows;
    // Only cascade regular rows (not wrap/taillights)
    const regular = rows.filter(
      (r) =>
        r.type !== 'action' ||
        ((r as ActionBarRow).actionType !== 'wrap' &&
          (r as ActionBarRow).actionType !== 'taillights')
    );

    const firstSceneId = regular.find((r) => r.type === 'scene' && !r.preSchedule)?.id;
    const updates: { id: string; changes: Record<string, string> }[] = [];
    let prevEnd = ''; // track the running end time through the chain

    for (let i = 0; i < regular.length; i++) {
      const curr = regular[i];
      const changes: Record<string, string> = {};
      let currentStart = curr.timeStart;
      let currentEnd = curr.timeEnd;

      // For rows after the first, start time should match previous end
      if (i > 0 && prevEnd) {
        // Don't override the first scene's start — First Shot sync owns it
        if (curr.id === firstSceneId && schedule.firstShotTime) {
          currentStart = curr.timeStart;
        } else if (curr.timeStart !== prevEnd) {
          changes.timeStart = prevEnd;
          currentStart = prevEnd;
        }
      }

      // Always recalculate end from start + allow
      if (curr.allowTime && currentStart) {
        const newEnd = calculateEndTime(currentStart, curr.allowTime);
        if (newEnd && newEnd !== curr.timeEnd) {
          changes.timeEnd = newEnd;
          currentEnd = newEnd;
        }
      }

      if (Object.keys(changes).length > 0) {
        updates.push({ id: curr.id, changes });
      }

      // Use the CALCULATED end time for the next iteration, not the stored one
      prevEnd = currentEnd;
    }

    if (updates.length === 0) return; // All times correct — no infinite loop

    updates.forEach((u) => updateRow(u.id, u.changes));
  }, [schedule.rows, updateRow]);

  const handleDragStart = useCallback((e: React.DragEvent, rowId: string, sectionRows: { id: string }[], section: 'pre' | 'main') => {
    // Don't drag if the target is an interactive element
    const target = e.target as HTMLElement;
    if (target.closest('input, textarea, button, [contenteditable]')) {
      e.preventDefault();
      return;
    }
    wasDragging.current = true;
    setDraggedId(rowId);
    setDragSection(section);
    setPreviewOrder(sectionRows.map(r => r.id));
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', rowId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number, section?: 'pre' | 'main') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedId !== null && (!section || dragSection === section)) {
      setPreviewOrder(prev => {
        if (!prev) return prev;
        const currentPos = prev.indexOf(draggedId);
        if (currentPos === index) return prev;
        const next = prev.filter(id => id !== draggedId);
        next.splice(index, 0, draggedId);
        return next;
      });
    }
  }, [draggedId, dragSection]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (draggedId == null || previewOrder == null) return;

    const fromRow = schedule.rows.findIndex((r) => r.id === draggedId);
    const toVisualIndex = previewOrder.indexOf(draggedId);
    // Map the preview position back to schedule.rows index
    let toRow: number;
    if (toVisualIndex >= previewOrder.length - 1) {
      // Last position — find the index after the last non-dragged row
      const lastId = previewOrder[previewOrder.length - 1];
      if (lastId === draggedId && previewOrder.length > 1) {
        const beforeLastId = previewOrder[previewOrder.length - 2];
        toRow = schedule.rows.findIndex((r) => r.id === beforeLastId) + 1;
      } else {
        toRow = schedule.rows.findIndex((r) => r.id === lastId) + 1;
      }
    } else {
      // Find the row that's currently at the target visual position
      // The dragged item wants to go before the item currently after it in preview
      const nextId = previewOrder[toVisualIndex + 1];
      toRow = schedule.rows.findIndex((r) => r.id === nextId);
    }

    if (fromRow !== -1 && toRow !== -1 && fromRow !== toRow) {
      const adjustedTo = fromRow < toRow ? toRow - 1 : toRow;
      reorderRows(fromRow, adjustedTo);
    }

    setDraggedId(null);
    setPreviewOrder(null);
    setDragSection(null);
    setTimeout(() => { wasDragging.current = false; }, 0);
  }, [draggedId, previewOrder, schedule.rows, reorderRows]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setPreviewOrder(null);
    setDragSection(null);
    setTimeout(() => { wasDragging.current = false; }, 0);
  }, []);

  const createSceneRow = (preSchedule = false): SceneRowType => ({
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
    preSchedule,
  });

  const createActionRow = (preSchedule = false): ActionBarRow => ({
    id: crypto.randomUUID(),
    type: 'action',
    timeStart: '',
    timeEnd: '',
    label: '',
    actionType: 'custom' as ActionBarType,
    allowTime: '',
    preSchedule,
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

  const handleInsertPreRow = (afterId: string, type: 'scene' | 'action') => {
    const row = type === 'scene' ? createSceneRow(true) : createActionRow(true);
    insertRowAfter(afterId, row);
    setInsertMenuId(null);
  };

  const handleAddPreRow = (type: 'scene' | 'action') => {
    const row = type === 'scene' ? createSceneRow(true) : createActionRow(true);
    const preRows = schedule.rows.filter(r => r.preSchedule);
    if (preRows.length > 0) {
      insertRowAfter(preRows[preRows.length - 1].id, row);
    } else {
      updateField('rows', [row, ...schedule.rows]);
    }
    setInsertMenuId(null);
  };

  return (
    <div
      className="max-w-[1100px] mx-auto bg-white shadow-sm border-b border-gray-300"
      id="schedule-content"
      style={{
        fontFamily: (schedule.fontFamily || 'Nunito') ? `"${schedule.fontFamily || 'Nunito'}", sans-serif` : undefined,
        fontSize: (schedule.fontSize || 12) + 'px',
      }}
    >
      <HeaderBar />
      <InfoGrid />
      <VersionBar />
      <QuickRefBar />
      <ColumnHeaders />
      <CrewCallRow />
      <FirstShotRow />

      {/* Pre-schedule rows (between First Shot and Day Title) */}
      {(() => {
        const preRows = schedule.rows.filter(r => r.preSchedule);
        const displayPreRows = dragSection === 'pre' && previewOrder
          ? previewOrder.map(id => preRows.find(r => r.id === id)!).filter(Boolean)
          : preRows;

        return (
          <>
            {displayPreRows.map((row, index) => {
              const isDragged = draggedId === row.id;
              return (
                <div key={row.id}>
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, row.id, preRows, 'pre')}
                    onDragOver={(e) => handleDragOver(e, index, 'pre')}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDrop}
                    className={`relative transition-all duration-200 ${
                      isDragged
                        ? 'scale-[1.02] shadow-lg bg-blue-50/50 border border-blue-300 rounded z-10'
                        : draggedId != null && dragSection === 'pre'
                          ? 'opacity-60'
                          : ''
                    }`}
                    data-export-hide={isDragged ? true : undefined}
                  >
                    {row.type === 'scene' ? (
                      <SceneRow row={row as SceneRowType} startTimeReadOnly={false} />
                    ) : (
                      <ActionBar row={row as ActionBarRow} />
                    )}
                  </div>

                  {/* Insert button between pre-rows */}
                  <div className="relative h-0 group/insert">
                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/insert:opacity-100 transition-opacity">
                      <InsertMenu
                        menuId={`pre-${row.id}`}
                        insertMenuId={insertMenuId}
                        setInsertMenuId={setInsertMenuId}
                        onScene={() => handleInsertPreRow(row.id, 'scene')}
                        onAction={() => handleInsertPreRow(row.id, 'action')}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add pre-row button */}
            <div
              className="border border-gray-300 border-t-0 px-4 py-2 flex items-center justify-center gap-2 relative"
              data-export-hide
              onDragOver={(e) => handleDragOver(e, preRows.length, 'pre')}
              onDrop={handleDrop}
            >
              <InsertMenuLarge
                menuId="__pre-end"
                insertMenuId={insertMenuId}
                setInsertMenuId={setInsertMenuId}
                onScene={() => handleAddPreRow('scene')}
                onAction={() => handleAddPreRow('action')}
              />
            </div>
          </>
        );
      })()}

      <DayTitleRow />

      {(() => {
        const regularRows = schedule.rows.filter(
          (r) =>
            !r.preSchedule &&
            (r.type !== 'action' ||
            ((r as ActionBarRow).actionType !== 'wrap' &&
              (r as ActionBarRow).actionType !== 'taillights'))
        );
        const terminalRows = schedule.rows.filter(
          (r) =>
            r.type === 'action' &&
            ((r as ActionBarRow).actionType === 'wrap' ||
              (r as ActionBarRow).actionType === 'taillights')
        );

        const displayRows = dragSection === 'main' && previewOrder
          ? previewOrder.map(id => regularRows.find(r => r.id === id)!).filter(Boolean)
          : regularRows;

        const firstSceneIndex = displayRows.findIndex(r => r.type === 'scene');

        return (
          <>
            {displayRows.map((row, index) => {
              const isDragged = draggedId === row.id;
              const isFirstScene = row.type === 'scene' && index === firstSceneIndex;
              return (
                <div key={row.id}>
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, row.id, regularRows, 'main')}
                    onDragOver={(e) => handleDragOver(e, index, 'main')}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDrop}
                    className={`relative transition-all duration-200 ${
                      isDragged
                        ? 'scale-[1.02] shadow-lg bg-blue-50/50 border border-blue-300 rounded z-10'
                        : draggedId != null && dragSection === 'main'
                          ? 'opacity-60'
                          : ''
                    }`}
                    data-export-hide={isDragged ? true : undefined}
                  >
                    {row.type === 'scene' ? (
                      <SceneRow row={row as SceneRowType} startTimeReadOnly={isFirstScene} />
                    ) : (
                      <ActionBar row={row as ActionBarRow} />
                    )}
                  </div>

                  {/* Insert button between rows */}
                  <div className="relative h-0 group/insert">
                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/insert:opacity-100 transition-opacity">
                      <InsertMenu
                        menuId={row.id}
                        insertMenuId={insertMenuId}
                        setInsertMenuId={setInsertMenuId}
                        onScene={() => handleInsert(row.id, 'scene')}
                        onAction={() => handleInsert(row.id, 'action')}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add row button - inserts before terminal rows */}
            <div
              className="border border-gray-300 border-t-0 px-4 py-2 flex items-center justify-center gap-2 relative"
              data-export-hide
              onDragOver={(e) => handleDragOver(e, regularRows.length, 'main')}
              onDrop={handleDrop}
            >
              <InsertMenuLarge
                menuId="__end"
                insertMenuId={insertMenuId}
                setInsertMenuId={setInsertMenuId}
                onScene={() => handleAddToEnd('scene')}
                onAction={() => handleAddToEnd('action')}
              />
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
