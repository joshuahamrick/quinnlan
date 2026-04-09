"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [hasSavedSchedule, setHasSavedSchedule] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("quinnlan-schedule");
    if (stored) {
      setHasSavedSchedule(true);
    }
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Quinnlan
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          Production Schedule Builder
        </p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/schedule/edit"
          className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          New Schedule
        </Link>
        {hasSavedSchedule && (
          <Link
            href="/schedule/edit"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Continue Editing
          </Link>
        )}
      </div>
    </div>
  );
}
