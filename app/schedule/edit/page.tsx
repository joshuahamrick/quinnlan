"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScheduleStore } from "@/lib/store";
import { FormattingProvider } from "@/lib/formatting-context";
import ScheduleEditor from "@/components/schedule/ScheduleEditor";
import ExportButtons from "@/components/schedule/ExportButtons";
import FormattingToolbar from "@/components/schedule/FormattingToolbar";

export default function ScheduleEditPage() {
  const scheduleRef = useRef<HTMLDivElement>(null);
  const resetSchedule = useScheduleStore((s) => s.resetSchedule);

  function handleNewSchedule() {
    if (window.confirm("Start a new schedule? Any unsaved changes will be lost.")) {
      resetSchedule();
    }
  }

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

        {/* Schedule editor */}
        <div className="flex-1 bg-gray-100 p-6">
          <div ref={scheduleRef}>
            <ScheduleEditor />
          </div>
        </div>
      </div>
    </FormattingProvider>
  );
}
