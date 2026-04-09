"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useScheduleStore } from "@/lib/store";
import ScheduleEditor from "@/components/schedule/ScheduleEditor";
import ExportButtons from "@/components/schedule/ExportButtons";
import ColorThemePanel from "@/components/schedule/ColorThemePanel";

export default function ScheduleEditPage() {
  const scheduleRef = useRef<HTMLDivElement>(null);
  const resetSchedule = useScheduleStore((s) => s.resetSchedule);
  const [showColorPanel, setShowColorPanel] = useState(true);

  function handleNewSchedule() {
    if (window.confirm("Start a new schedule? Any unsaved changes will be lost.")) {
      resetSchedule();
    }
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left sidebar — color theme panel */}
      {showColorPanel && (
        <aside className="w-64 shrink-0 border-r border-gray-200 overflow-y-auto bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Theme</h2>
            <button
              onClick={() => setShowColorPanel(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Hide
            </button>
          </div>
          <ColorThemePanel />
        </aside>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-2 bg-white">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back
          </Link>
          <div className="h-4 w-px bg-gray-200" />
          {!showColorPanel && (
            <button
              onClick={() => setShowColorPanel(true)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Show Theme
            </button>
          )}
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

        {/* Schedule editor */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div ref={scheduleRef}>
            <ScheduleEditor />
          </div>
        </div>
      </div>
    </div>
  );
}
