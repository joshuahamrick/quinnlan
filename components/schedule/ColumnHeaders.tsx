'use client';

export default function ColumnHeaders() {
  return (
    <div className="grid grid-cols-[10%_25%_20%_12%_25%_8%] border border-gray-300 border-t-0 bg-white text-xs font-bold">
      <div className="border-r border-gray-300 px-2 py-1">Time</div>
      <div className="border-r border-gray-300 px-2 py-1">Description</div>
      <div className="border-r border-gray-300 px-2 py-1">Boards</div>
      <div className="border-r border-gray-300 px-2 py-1">Talent</div>
      <div className="border-r border-gray-300 px-2 py-1">Details / Notes</div>
      <div className="px-2 py-1">Allow</div>
    </div>
  );
}
