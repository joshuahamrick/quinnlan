"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useScheduleStore } from "@/lib/store";
import { FormattingProvider } from "@/lib/formatting-context";

const ScheduleEditor = dynamic(() => import("@/components/schedule/ScheduleEditor"), { ssr: false });
const ExportButtons = dynamic(() => import("@/components/schedule/ExportButtons"), { ssr: false });
const FormattingToolbar = dynamic(() => import("@/components/schedule/FormattingToolbar"), { ssr: false });

function PaperSizeToggle() {
  const paperSize = useScheduleStore((s) => s.schedule.paperSize);
  const updateField = useScheduleStore((s) => s.updateField);

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => updateField('paperSize', 'letter')}
        className={`px-2 py-1 text-xs rounded-l transition-colors ${
          paperSize === 'letter'
            ? 'bg-gray-200 text-gray-800 font-medium'
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        Letter
      </button>
      <button
        onClick={() => updateField('paperSize', 'legal')}
        className={`px-2 py-1 text-xs rounded-r transition-colors ${
          paperSize === 'legal'
            ? 'bg-gray-200 text-gray-800 font-medium'
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        Legal
      </button>
    </div>
  );
}

export default function ScheduleEditPage() {
  const scheduleRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const zoomWrapperRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);
  const displayTimerRef = useRef<NodeJS.Timeout>(undefined);
  const resetSchedule = useScheduleStore((s) => s.resetSchedule);
  const [displayZoom, setDisplayZoom] = useState(1);

  function handleNewSchedule() {
    if (window.confirm("Start a new schedule? Any unsaved changes will be lost.")) {
      resetSchedule();
    }
  }

  const applyZoom = useCallback((newZoom: number) => {
    const clamped = Math.min(3, Math.max(0.25, newZoom));
    zoomRef.current = clamped;
    if (zoomWrapperRef.current) {
      zoomWrapperRef.current.style.transform = `scale(${clamped})`;
    }
    return clamped;
  }, []);

  const updateDisplay = useCallback((newZoom: number) => {
    if (displayTimerRef.current) clearTimeout(displayTimerRef.current);
    displayTimerRef.current = setTimeout(() => {
      setDisplayZoom(newZoom);
    }, 100);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    const clamped = applyZoom(newZoom);
    updateDisplay(clamped);
  }, [applyZoom, updateDisplay]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.005;
      handleZoomChange(zoomRef.current + delta);
    }
  }, [handleZoomChange]);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (el) {
      el.addEventListener("wheel", handleWheel, { passive: false });
      return () => el.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  return (
    <FormattingProvider>
      <div className="flex flex-1 flex-col">
        {/* Sticky toolbar area */}
        <div className="sticky top-0 z-40 bg-white shadow-sm" data-export-hide>
          {/* Nav toolbar */}
          <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-2">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              &larr; Back
            </Link>
            <div className="h-4 w-px bg-gray-200" />
            <button
              onClick={handleNewSchedule}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              New Schedule
            </button>
            <div className="ml-auto">
              <ExportButtons targetRef={scheduleRef} />
            </div>
          </div>

          {/* Formatting toolbar */}
          <FormattingToolbar />
        </div>

        {/* Schedule editor — zoomable scroll area */}
        <div
          ref={scrollAreaRef}
          className="flex-1 overflow-auto bg-gray-100 pb-12"
          style={{ position: 'relative' }}
        >
          <div style={{
            minWidth: 'min-content',
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'center',
          }}>
            <div
              ref={zoomWrapperRef}
              style={{
                transform: `scale(${1})`,
                transformOrigin: 'top center',
                willChange: 'transform',
              }}
            >
              <div ref={scheduleRef}>
                <ScheduleEditor />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom toolbar — paper size + zoom controls */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 h-10 bg-white border-t border-gray-200 flex items-center px-4"
          data-export-hide
        >
          <PaperSizeToggle />
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleZoomChange(Math.round((zoomRef.current - 0.2) * 100) / 100)}
              className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 text-sm transition-colors"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="text-xs text-gray-600 w-12 text-center tabular-nums">
              {Math.round(displayZoom * 100)}%
            </span>
            <button
              onClick={() => handleZoomChange(Math.round((zoomRef.current + 0.2) * 100) / 100)}
              className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 text-sm transition-colors"
              aria-label="Zoom in"
            >
              +
            </button>
            {displayZoom !== 1 && (
              <button
                onClick={() => handleZoomChange(1)}
                className="text-xs text-gray-400 hover:text-gray-600 ml-1 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </FormattingProvider>
  );
}
