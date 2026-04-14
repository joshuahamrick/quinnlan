"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useScheduleStore } from "@/lib/store";
import { FormattingProvider } from "@/lib/formatting-context";
import ScheduleEditor from "@/components/schedule/ScheduleEditor";
import ExportButtons from "@/components/schedule/ExportButtons";
import FormattingToolbar from "@/components/schedule/FormattingToolbar";

export default function ScheduleEditPage() {
  const scheduleRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const resetSchedule = useScheduleStore((s) => s.resetSchedule);
  const [zoom, setZoom] = useState(1);

  function handleNewSchedule() {
    if (window.confirm("Start a new schedule? Any unsaved changes will be lost.")) {
      resetSchedule();
    }
  }

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      setZoom((prev) => Math.min(3, Math.max(0.25, prev + delta)));
    }
  }, []);

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
        <div ref={scrollAreaRef} className="flex-1 overflow-auto bg-gray-100 p-6">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              width: `${100 / zoom}%`,
            }}
          >
            <div ref={scheduleRef}>
              <ScheduleEditor />
            </div>
          </div>
        </div>

        {/* Zoom controls — Canva-style bottom-right pill */}
        <div
          className="fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-lg"
          data-export-hide
        >
          <button
            onClick={() => setZoom((z) => Math.max(0.25, Math.round((z - 0.1) * 100) / 100))}
            className="flex h-6 w-6 items-center justify-center rounded-full text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="w-12 text-center text-xs tabular-nums text-gray-700">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(3, Math.round((z + 0.1) * 100) / 100))}
            className="flex h-6 w-6 items-center justify-center rounded-full text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Zoom in"
          >
            +
          </button>
          {zoom !== 1 && (
            <button
              onClick={() => setZoom(1)}
              className="ml-1 rounded-full px-2 py-0.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </FormattingProvider>
  );
}
