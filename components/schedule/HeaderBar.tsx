'use client';

import { useState, useRef, useEffect } from 'react';
import { useScheduleStore } from '@/lib/store';
import EditableText from './EditableText';
import { formatScheduleDate } from '@/lib/date-utils';

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function parseSelectedDate(dateStr: string): Date | null {
  // Try to parse our formatted string back to a Date
  // Format: "Thursday, March 19th"
  const match = dateStr.match(
    /^\w+,\s+(\w+)\s+(\d+)(?:st|nd|rd|th)$/
  );
  if (!match) return null;
  const monthIndex = MONTHS.indexOf(match[1]);
  if (monthIndex === -1) return null;
  const day = parseInt(match[2], 10);
  const now = new Date();
  return new Date(now.getFullYear(), monthIndex, day);
}

function CalendarPopup({
  selectedDate,
  onSelect,
  onClose,
}: {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  onClose: () => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(
    selectedDate?.getFullYear() ?? today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    selectedDate?.getMonth() ?? today.getMonth()
  );
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const isSelected = (day: number) =>
    selectedDate !== null &&
    day === selectedDate.getDate() &&
    viewMonth === selectedDate.getMonth() &&
    viewYear === selectedDate.getFullYear();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div
      ref={popupRef}
      className="absolute top-full right-0 mt-1 bg-white text-gray-800 rounded-lg shadow-xl p-3 select-none"
      style={{ zIndex: 9999, width: 280 }}
    >
      {/* Month/year header */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
        >
          &larr;
        </button>
        <span className="font-semibold text-sm">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
        >
          &rarr;
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-1">
        {DAYS_SHORT.map((d) => (
          <div key={d} className="py-0.5">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 text-center text-sm">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />;
          }
          const selected = isSelected(day);
          const todayMark = isToday(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelect(new Date(viewYear, viewMonth, day))}
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-colors
                ${selected ? 'bg-blue-600 text-white' : ''}
                ${todayMark && !selected ? 'ring-1 ring-blue-400 text-blue-600 font-semibold' : ''}
                ${!selected && !todayMark ? 'hover:bg-gray-100' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function HeaderBar() {
  const { schedule, updateField } = useScheduleStore();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const selectedDate = schedule.date ? parseSelectedDate(schedule.date) : null;

  const handleDateSelect = (date: Date) => {
    updateField('date', formatScheduleDate(date));
    setCalendarOpen(false);
  };

  return (
    <div
      className="relative px-4 py-2 text-white"
      style={{ backgroundColor: schedule.themeColor }}
    >
      <div className="relative flex items-center">
        {/* Left: SCHEDULE */}
        <div className="shrink-0">
          <span className="font-extrabold text-base tracking-[0.15em] uppercase">
            SCHEDULE
          </span>
        </div>

        {/* Center: Project Name - absolutely centered on the full bar */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <EditableText
              value={schedule.projectName}
              onChange={(v) => updateField('projectName', v)}
              placeholder="Project Name"
              className="text-white font-bold text-base [&_span]:text-white/60 [&_input]:text-center"
            />
          </div>
        </div>

        {/* Right: Date picker */}
        <div className="ml-auto shrink-0 text-right relative">
          <span
            className="cursor-pointer hover:bg-white/10 px-0.5 rounded transition-colors block text-right font-bold text-sm"
            onClick={() => setCalendarOpen(!calendarOpen)}
          >
            {schedule.date || (
              <span className="text-white/60 italic" data-export-hide>Click to set date</span>
            )}
          </span>
          {calendarOpen && (
            <CalendarPopup
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
              onClose={() => setCalendarOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
