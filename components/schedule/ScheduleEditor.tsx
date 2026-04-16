'use client';

import { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useScheduleStore } from '@/lib/store';
import { calculateDuration, calculateEndTime } from '@/lib/time-utils';
import type { SceneRow as SceneRowType, ActionBarRow, ActionBarType, InfoRow as InfoRowType } from '@/lib/types';
import { useWeatherSync } from '@/lib/useWeatherSync';
import { useHospitalSync } from '@/lib/useHospitalSync';
import HeaderBar from './HeaderBar';
import InfoGrid from './InfoGrid';
import VersionBar from './VersionBar';
import QuickRefBar from './QuickRefBar';
import ColumnHeaders from './ColumnHeaders';
import InfoRow from './InfoRow';
import DayTitleRow from './DayTitleRow';
import SceneRow from './SceneRow';
import ActionBar from './ActionBar';

// Usable page heights at 96dpi (page height minus 0.25in top+bottom margins)
const PAGE_HEIGHTS: Record<string, number> = {
  letter: 1008,
  legal: 1296,
};

function InsertMenu({
  menuId,
  insertMenuId,
  setInsertMenuId,
  onScene,
  onAction,
  onInfo,
  onPageBreak,
}: {
  menuId: string;
  insertMenuId: string | null;
  setInsertMenuId: (id: string | null) => void;
  onScene: () => void;
  onAction: () => void;
  onInfo?: () => void;
  onPageBreak?: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOpen = insertMenuId === menuId;
  const [showAbove, setShowAbove] = useState(false);

  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setShowAbove(window.innerHeight - rect.bottom < 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setInsertMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setInsertMenuId]);

  return (
    <div ref={menuRef}>
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
          {onInfo && (
            <button
              onClick={onInfo}
              className="block w-full px-3 py-1.5 text-xs hover:bg-gray-100 text-left"
            >
              Row
            </button>
          )}
          {onPageBreak && (
            <>
              <div className="border-t border-gray-200 my-0.5" />
              <button
                onClick={onPageBreak}
                className="block w-full px-3 py-1.5 text-xs hover:bg-gray-100 text-left text-blue-600"
              >
                Page Break
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function InsertMenuLarge({
  menuId,
  insertMenuId,
  setInsertMenuId,
  onScene,
  onAction,
  onInfo,
  onPageBreak,
}: {
  menuId: string;
  insertMenuId: string | null;
  setInsertMenuId: (id: string | null) => void;
  onScene: () => void;
  onAction: () => void;
  onInfo?: () => void;
  onPageBreak?: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOpen = insertMenuId === menuId;
  const [showAbove, setShowAbove] = useState(false);

  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setShowAbove(window.innerHeight - rect.bottom < 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setInsertMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setInsertMenuId]);

  return (
    <div ref={menuRef}>
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
          {onInfo && (
            <button
              onClick={onInfo}
              className="block w-full px-3 py-1.5 text-xs hover:bg-gray-100 text-left"
            >
              Row
            </button>
          )}
          {onPageBreak && (
            <>
              <div className="border-t border-gray-200 my-0.5" />
              <button
                onClick={onPageBreak}
                className="block w-full px-3 py-1.5 text-xs hover:bg-gray-100 text-left text-blue-600"
              >
                Page Break
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ScheduleEditor() {
  useWeatherSync();
  useHospitalSync();
  const { schedule, insertRowAfter, addRow, reorderRows, updateRow, updateField, addPageBreak, removePageBreak, removeRow, addExtraPage, removeExtraPage } = useScheduleStore();
  const [insertMenuId, setInsertMenuId] = useState<string | null>(null);
  const [deletePageConfirm, setDeletePageConfirm] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [previewOrder, setPreviewOrder] = useState<string[] | null>(null);
  const [dragSection, setDragSection] = useState<'pre' | 'main' | null>(null);
  const wasDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rowHeights, setRowHeights] = useState<number[]>([]);

  // Sync First Shot time → first scene row's start time
  useEffect(() => {
    const firstShotRow = schedule.rows.find((r): r is InfoRowType => r.type === 'info' && !!r.isFirstShot);
    const firstShotTime = firstShotRow?.timeStart || '';
    const firstScene = schedule.rows.find((r): r is SceneRowType => r.type === 'scene' && !r.preSchedule);
    if (firstScene && firstShotTime && firstScene.timeStart !== firstShotTime) {
      const newEnd = firstScene.allowTime
        ? calculateEndTime(firstShotTime, firstScene.allowTime)
        : firstScene.timeEnd || '';
      updateRow(firstScene.id, {
        timeStart: firstShotTime,
        ...(newEnd ? { timeEnd: newEnd } : {}),
      });
    }
  }, [schedule.rows, updateRow]);

  // Cascade times: each row's start time = previous row's end time
  useEffect(() => {
    const rows = schedule.rows;
    // Only cascade regular rows (not wrap/taillights/info)
    const regular = rows.filter(
      (r): r is SceneRowType | ActionBarRow =>
        r.type !== 'info' &&
        (r.type !== 'action' ||
        ((r as ActionBarRow).actionType !== 'wrap' &&
          (r as ActionBarRow).actionType !== 'taillights'))
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
        const fsRow = schedule.rows.find((r) => r.type === 'info' && (r as InfoRowType).isFirstShot) as InfoRowType | undefined;
        if (curr.id === firstSceneId && fsRow?.timeStart) {
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

    // Cancel drag if active element is editable (e.g. user clicked into a field)
    const active = document.activeElement;
    if (active && (
      active.tagName === 'INPUT' ||
      active.tagName === 'TEXTAREA' ||
      (active as HTMLElement).isContentEditable ||
      (active as HTMLElement).closest('[contenteditable="true"]')
    )) {
      e.preventDefault();
      return;
    }

    // Cancel drag if there's a text selection in progress
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
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

  const createInfoRow = (): InfoRowType => ({
    id: crypto.randomUUID(),
    type: 'info',
    preSchedule: true,
    timeStart: '',
    timeEnd: '',
    label: '',
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

  const handleInsertPreRow = (afterId: string, type: 'scene' | 'action' | 'info') => {
    const row = type === 'scene' ? createSceneRow(true) : type === 'info' ? createInfoRow() : createActionRow(true);
    insertRowAfter(afterId, row);
    setInsertMenuId(null);
  };

  const handleAddPreRow = (type: 'scene' | 'action' | 'info') => {
    const row = type === 'scene' ? createSceneRow(true) : type === 'info' ? createInfoRow() : createActionRow(true);
    const preRows = schedule.rows.filter(r => r.preSchedule);
    if (preRows.length > 0) {
      insertRowAfter(preRows[preRows.length - 1].id, row);
    } else {
      updateField('rows', [row, ...schedule.rows]);
    }
    setInsertMenuId(null);
  };

  const handlePageBreak = (afterRowId: string) => {
    addPageBreak(afterRowId);
    setInsertMenuId(null);
  };

  const handleDeletePage = (pageIdx: number) => {
    if (pageIdx === 0) return;
    // Count content pages (pages with actual items) vs extra empty pages
    const contentPageCount = pages.filter(p => p.length > 0).length;
    const extraPageStart = contentPageCount;
    // If deleting an extra empty page, just decrement
    if (pageIdx >= extraPageStart) {
      removeExtraPage();
      return;
    }
    const pageIndices = pages[pageIdx];
    if (!pageIndices) return;
    // Collect row IDs on this page
    const rowIdsToDelete = pageIndices
      .map(i => allItemRowIds[i])
      .filter((id): id is string => id !== null);
    // Remove page break that created this page (it's on the last row of the previous page)
    const prevPageIndices = pages[pageIdx - 1];
    if (prevPageIndices) {
      const lastPrevIdx = prevPageIndices[prevPageIndices.length - 1];
      const lastPrevRowId = allItemRowIds[lastPrevIdx];
      if (lastPrevRowId && schedule.pageBreaks.includes(lastPrevRowId)) {
        removePageBreak(lastPrevRowId);
      }
    }
    // Remove all rows on this page
    rowIdsToDelete.forEach(id => removeRow(id));
  };

  // Compute row groups
  const preRows = schedule.rows.filter(r => r.preSchedule);
  const displayPreRows = dragSection === 'pre' && previewOrder
    ? previewOrder.map(id => preRows.find(r => r.id === id)!).filter(Boolean)
    : preRows;

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

  // Build flat list of renderable items for pagination
  // Track row IDs in parallel so pagination can detect manual page breaks
  const allItems: React.ReactNode[] = [];
  const allItemRowIds: (string | null)[] = [];

  allItems.push(<div key="header"><HeaderBar /></div>);
  allItemRowIds.push(null);
  allItems.push(<div key="infogrid"><InfoGrid /></div>);
  allItemRowIds.push(null);
  allItems.push(<div key="versionbar"><VersionBar /></div>);
  allItemRowIds.push(null);
  allItems.push(<div key="quickref"><QuickRefBar /></div>);
  allItemRowIds.push(null);
  allItems.push(<div key="colheaders"><ColumnHeaders /></div>);
  allItemRowIds.push(null);

  // Pre-schedule rows
  displayPreRows.forEach((row, index) => {
    const isDragged = draggedId === row.id;
    allItems.push(
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
          ) : row.type === 'info' ? (
            <InfoRow row={row as InfoRowType} />
          ) : (
            <ActionBar row={row as ActionBarRow} />
          )}
        </div>
        <div className="relative h-0 group/insert">
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/insert:opacity-100 transition-opacity">
            <InsertMenu
              menuId={`pre-${row.id}`}
              insertMenuId={insertMenuId}
              setInsertMenuId={setInsertMenuId}
              onScene={() => handleInsertPreRow(row.id, 'scene')}
              onAction={() => handleInsertPreRow(row.id, 'action')}
              onInfo={() => handleInsertPreRow(row.id, 'info')}
            />
          </div>
        </div>
      </div>
    );
    allItemRowIds.push(row.id);
  });

  // Add pre-row button
  allItems.push(
    <div key="__pre-end-btn" data-schedule-row data-export-hide>
      <div
        className="border border-gray-300 border-t-0 px-4 py-2 flex items-center justify-center gap-2 relative"
        onDragOver={(e) => handleDragOver(e, preRows.length, 'pre')}
        onDrop={handleDrop}
      >
        <InsertMenuLarge
          menuId="__pre-end"
          insertMenuId={insertMenuId}
          setInsertMenuId={setInsertMenuId}
          onScene={() => handleAddPreRow('scene')}
          onAction={() => handleAddPreRow('action')}
          onInfo={() => handleAddPreRow('info')}
        />
      </div>
    </div>
  );
  allItemRowIds.push(null);

  // Day title
  allItems.push(<div key="daytitle"><DayTitleRow /></div>);
  allItemRowIds.push(null);

  // Regular rows
  displayRows.forEach((row, index) => {
    const isDragged = draggedId === row.id;
    const isFirstScene = row.type === 'scene' && index === firstSceneIndex;
    allItems.push(
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
        <div className="relative h-0 group/insert">
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/insert:opacity-100 transition-opacity">
            <InsertMenu
              menuId={row.id}
              insertMenuId={insertMenuId}
              setInsertMenuId={setInsertMenuId}
              onScene={() => handleInsert(row.id, 'scene')}
              onAction={() => handleInsert(row.id, 'action')}
              onPageBreak={() => handlePageBreak(row.id)}
            />
          </div>
        </div>
      </div>
    );
    allItemRowIds.push(row.id);
  });

  // Add row button
  allItems.push(
    <div key="__end-btn" data-schedule-row data-export-hide>
      <div
        className="border border-gray-300 border-t-0 px-4 py-2 flex items-center justify-center gap-2 relative"
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
    </div>
  );
  allItemRowIds.push(null);

  // Terminal rows (wrap + taillights) always at bottom
  terminalRows.forEach((row) => {
    allItems.push(
      <div key={row.id}>
        <ActionBar row={row as ActionBarRow} />
      </div>
    );
    allItemRowIds.push(row.id);
  });

  // Measure row heights after render for pagination
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const elements = container.querySelectorAll('[data-schedule-row]');
    const heights = Array.from(elements).map(el => (el as HTMLElement).offsetHeight);
    setRowHeights(prev => {
      if (prev.length === heights.length && prev.every((h, i) => h === heights[i])) return prev;
      return heights;
    });
  });

  // Compute page assignments
  const pageHeight = PAGE_HEIGHTS[schedule.paperSize] || PAGE_HEIGHTS.letter;
  const pageBreakSet = new Set(schedule.pageBreaks);
  const pages: number[][] = [];
  if (rowHeights.length === allItems.length && allItems.length > 0) {
    let currentPageHeight = 0;
    let currentPage: number[] = [];
    for (let i = 0; i < allItems.length; i++) {
      if (currentPageHeight + rowHeights[i] > pageHeight && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [i];
        currentPageHeight = rowHeights[i];
      } else {
        currentPage.push(i);
        currentPageHeight += rowHeights[i];
      }
      // Force page break after this item if its row ID is in pageBreaks
      const rowId = allItemRowIds[i];
      if (rowId && pageBreakSet.has(rowId) && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
        currentPageHeight = 0;
      }
    }
    if (currentPage.length > 0) pages.push(currentPage);

    // Append extra empty pages only after content pages exist
    const extraPages = schedule.extraPages || 0;
    for (let i = 0; i < extraPages; i++) {
      pages.push([]);
    }
  }

  const hasPagination = rowHeights.length === allItems.length && allItems.length > 0 && pages.length > 0;

  const paperStyles: React.CSSProperties = {
    width: '816px',
    maxWidth: '816px',
    fontFamily: (schedule.fontFamily || 'Nunito') ? `"${schedule.fontFamily || 'Nunito'}", sans-serif` : undefined,
    fontSize: (schedule.fontSize || 12) + 'px',
    borderWidth: (schedule.borderWidth ?? 2) + 'px',
    borderColor: schedule.borderColor || '#9ca3af',
    borderStyle: 'solid',
  };

  return (
    <div ref={containerRef} id="schedule-content">
      {hasPagination ? (
        pages.map((pageIndices, pageIdx) => (
          <div key={pageIdx}>
            {/* Page label + trash icon in one container for symmetric spacing */}
            <div className="py-8 flex flex-col items-center gap-2" data-export-hide>
              <div className="flex items-center gap-3">
                <div className="w-16 border-t border-gray-300" />
                <span className="text-sm font-semibold text-gray-500 tracking-wide">Page {pageIdx + 1}</span>
                <div className="w-16 border-t border-gray-300" />
                {pageIdx > 0 && (
                  <button
                    onClick={() => setDeletePageConfirm(pageIdx)}
                    className="text-gray-400 hover:text-rose-400 hover:bg-rose-50/50 rounded p-1.5 transition-colors"
                    title="Delete page"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            {/* Page content */}
            <div
              className="relative mx-auto bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)]"
              style={{ ...paperStyles, minHeight: pageHeight + 'px' }}
            >
              {pageIndices.map(i => allItems[i])}
            </div>
          </div>
        ))
      ) : (
        <div
          className="mx-auto bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)]"
          style={paperStyles}
        >
          {allItems}
        </div>
      )}
      <div className="flex justify-center mt-6" data-export-hide>
        <button
          onClick={addExtraPage}
          className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-600 font-medium hover:bg-gray-50 hover:border-gray-400 shadow-sm transition-colors"
        >
          <span className="text-blue-500 text-lg leading-none">+</span>
          Add Page
        </button>
      </div>
      {deletePageConfirm !== null && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-rose-50 rounded-full flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete this page?</h3>
            <p className="text-sm text-gray-500 mb-6">All content on this page will be removed.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeletePageConfirm(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl px-5 py-2 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { handleDeletePage(deletePageConfirm); setDeletePageConfirm(null); }}
                className="bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-xl px-5 py-2 text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
