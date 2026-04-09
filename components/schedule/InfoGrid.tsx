'use client';

import { useRef, useState, useCallback } from 'react';
import { useScheduleStore } from '@/lib/store';
import SectionModal from './SectionModal';

type ModalType = 'contacts' | 'logos' | 'callTimes' | 'talentCalls' | 'director' | 'hospital' | null;

export default function InfoGrid() {
  const {
    schedule,
    updateField,
    addContact,
    removeContact,
    updateContact,
    addLogo,
    removeLogo,
    addCallTime,
    removeCallTime,
    updateCallTime,
    addTalentCall,
    removeTalentCall,
    updateTalentCall,
    addBgCall,
    removeBgCall,
    updateBgCall,
  } = useScheduleStore();

  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <>
      {/* Info Grid — 5-column CSS grid matching Canva reference layout */}
      <div
        className="border border-gray-300 text-[10px] leading-tight"
        style={{
          display: 'grid',
          gridTemplateColumns: '12% 18% 16% 20% 34%',
          gridTemplateRows: 'auto auto',
        }}
      >
        {/* CONTACTS — full height, centered */}
        <div
          className="border-r border-gray-300 p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/40 transition-colors"
          style={{ gridRow: '1 / 3' }}
          onClick={() => setActiveModal('contacts')}
        >
          <div className="font-extrabold text-[10px] uppercase mb-1.5">Contacts:</div>
          {schedule.contacts.map((c) => (
            <div key={c.id} className="mb-1">
              {c.title && <div className="font-semibold italic text-[9px]">{c.title}</div>}
              {c.name && <div className="text-[9px]">{c.name}</div>}
              {c.phone && <div className="text-[9px]">{c.phone}</div>}
            </div>
          ))}
          {schedule.contacts.length === 0 && (
            <div className="text-gray-400 italic text-[9px]">Click to add contacts</div>
          )}
        </div>

        {/* LOGOS — full height, centered, with resize */}
        <div
          className="border-r border-gray-300 p-2 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-50/40 transition-colors relative"
          style={{ gridRow: '1 / 3' }}
          onClick={() => setActiveModal('logos')}
        >
          {schedule.logos.filter((l) => l.url).length > 0 ? (
            schedule.logos
              .filter((l) => l.url)
              .map((logo) => (
                <img
                  key={logo.id}
                  src={logo.url}
                  alt={logo.name}
                  className="max-w-full object-contain"
                  style={{
                    maxHeight: `${96 * schedule.logoScale}px`,
                    transform: `scale(${schedule.logoScale})`,
                    transformOrigin: 'center center',
                  }}
                />
              ))
          ) : (
            <div className="text-gray-400 italic text-[9px]">Click to add logos</div>
          )}
          {schedule.logos.filter((l) => l.url).length > 0 && (
            <LogoResizeHandle />
          )}
        </div>

        {/* CALL TIMES — full height */}
        <div
          className="border-r border-gray-300 p-2 cursor-pointer hover:bg-blue-50/40 transition-colors"
          style={{ gridRow: '1 / 3' }}
          onClick={() => setActiveModal('callTimes')}
        >
          {schedule.callTimes.map((ct) => (
            <div key={ct.id} className="mb-0.5">
              {ct.time && ct.label ? (
                <span>
                  <span className="font-semibold">{ct.time}:</span> {ct.label}
                </span>
              ) : (
                <span className="text-gray-400 italic">—</span>
              )}
            </div>
          ))}
          {schedule.callTimes.length === 0 && (
            <div className="text-gray-400 italic text-[9px]">Click to add call times</div>
          )}
        </div>

        {/* TALENT CALLS + BG CALLS — top portion of col 4 */}
        <div
          className="border-r border-gray-300 border-b border-gray-300 p-2 cursor-pointer hover:bg-blue-50/40 transition-colors"
          onClick={() => setActiveModal('talentCalls')}
        >
          <div className="font-extrabold text-[10px] uppercase mb-1">Talent Calls:</div>
          {schedule.talentCalls.map((tc) => (
            <div key={tc.id} className="mb-0.5">
              {tc.label && tc.time ? (
                <span>{tc.label}: {tc.time}</span>
              ) : null}
            </div>
          ))}
          {schedule.bgCalls.length > 0 && (
            <>
              <div className="font-extrabold text-[10px] uppercase mt-1.5 mb-0.5">BG Calls:</div>
              {schedule.bgCalls.map((bc) => (
                <div key={bc.id} className="mb-0.5">
                  {bc.label && bc.time ? (
                    <span>{bc.label}: {bc.time}</span>
                  ) : null}
                </div>
              ))}
            </>
          )}
          {schedule.talentCalls.length === 0 && schedule.bgCalls.length === 0 && (
            <div className="text-gray-400 italic text-[9px]">Click to add</div>
          )}
        </div>

        {/* DIRECTOR + DATE + WEATHER — top portion of col 5 */}
        <div
          className="p-2 border-b border-gray-300 cursor-pointer hover:bg-blue-50/40 transition-colors"
          onClick={() => setActiveModal('director')}
        >
          <div className="font-extrabold text-[10px] uppercase mb-0.5">Director</div>
          {schedule.director ? (
            <div className="font-semibold">{schedule.director}</div>
          ) : (
            <div className="text-gray-400 italic text-[9px]">Click to set</div>
          )}
          <div className="mt-1.5 space-y-0.5">
            {schedule.date && (
              <div className="font-extrabold uppercase text-[9px]">{schedule.date}</div>
            )}
            {schedule.sunrise && (
              <div><span className="font-semibold">Sunrise:</span> {schedule.sunrise}{schedule.sunset ? ` | Sunset: ${schedule.sunset}` : ''}</div>
            )}
            {schedule.weather && (
              <div><span className="font-semibold">Weather:</span> {schedule.weather}</div>
            )}
            {(schedule.dayNumber || schedule.totalDays) && (
              <div className="font-semibold">Day {schedule.dayNumber} of {schedule.totalDays}</div>
            )}
            {!schedule.date && !schedule.sunrise && !schedule.weather && (
              <div className="text-gray-400 italic text-[9px]">Click to set date/weather</div>
            )}
          </div>
        </div>

        {/* HOSPITAL — spans bottom of columns 4 and 5 */}
        <div
          className="p-2 cursor-pointer hover:bg-blue-50/40 transition-colors"
          style={{ gridColumn: '4 / 6' }}
          onClick={() => setActiveModal('hospital')}
        >
          <div className="flex items-start gap-2.5">
            <HospitalIcon />
            <div className="flex-1 min-w-0">
              {schedule.hospitalName ? (
                <div>
                  <div className="font-extrabold text-[10px] uppercase mb-0.5">Hospital:</div>
                  <div className="font-semibold text-[9px]">{schedule.hospitalName}</div>
                  {schedule.hospitalDepartment && (
                    <div className="text-[9px]">{schedule.hospitalDepartment}</div>
                  )}
                  {schedule.hospitalAddress && <div className="text-[9px]">{schedule.hospitalAddress}</div>}
                  {schedule.hospitalPhone && <div className="text-[9px]">{schedule.hospitalPhone}</div>}
                </div>
              ) : (
                <div>
                  <div className="font-extrabold text-[10px] uppercase mb-0.5">Hospital:</div>
                  <div className="text-gray-400 italic text-[9px]">Click to add hospital</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---- MODALS ---- */}

      {/* Contacts Modal */}
      <SectionModal
        open={activeModal === 'contacts'}
        onClose={() => setActiveModal(null)}
        title="Contacts"
      >
        <div className="space-y-4">
          {schedule.contacts.map((c) => (
            <div key={c.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-500 uppercase">Title</label>
                <button
                  onClick={() => removeContact(c.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={c.title}
                onChange={(e) => updateContact(c.id, { title: e.target.value })}
                placeholder="e.g. Producer"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
              />
              <label className="text-xs font-semibold text-gray-500 uppercase block">Name</label>
              <input
                type="text"
                value={c.name}
                onChange={(e) => updateContact(c.id, { name: e.target.value })}
                placeholder="Name"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
              />
              <label className="text-xs font-semibold text-gray-500 uppercase block">Phone</label>
              <input
                type="text"
                value={c.phone}
                onChange={(e) => updateContact(c.id, { phone: e.target.value })}
                placeholder="Phone"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
              />
            </div>
          ))}
          <button
            onClick={addContact}
            className="w-full border border-dashed border-gray-300 rounded-lg py-2 text-sm text-blue-600 hover:bg-blue-50 font-semibold"
          >
            + Add Contact
          </button>
        </div>
      </SectionModal>

      {/* Logos Modal */}
      <SectionModal
        open={activeModal === 'logos'}
        onClose={() => setActiveModal(null)}
        title="Logos"
      >
        <div className="space-y-4">
          {schedule.logos.map((logo) => (
            <LogoModalSlot key={logo.id} logo={logo} onRemove={() => removeLogo(logo.id)} />
          ))}
          <button
            onClick={addLogo}
            className="w-full border border-dashed border-gray-300 rounded-lg py-2 text-sm text-blue-600 hover:bg-blue-50 font-semibold"
          >
            + Add Logo
          </button>
        </div>
      </SectionModal>

      {/* Call Times Modal */}
      <SectionModal
        open={activeModal === 'callTimes'}
        onClose={() => setActiveModal(null)}
        title="Call Times"
      >
        <div className="space-y-3">
          {schedule.callTimes.map((ct) => (
            <div key={ct.id} className="flex items-center gap-2">
              <input
                type="text"
                value={ct.time}
                onChange={(e) => updateCallTime(ct.id, { time: e.target.value })}
                placeholder="Time (e.g. 7:30A)"
                className="w-28 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400 font-semibold"
              />
              <input
                type="text"
                value={ct.label}
                onChange={(e) => updateCallTime(ct.id, { label: e.target.value })}
                placeholder="Label (e.g. Production)"
                className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
              />
              <button
                onClick={() => removeCallTime(ct.id)}
                className="text-red-500 hover:text-red-700 text-xs shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addCallTime}
            className="w-full border border-dashed border-gray-300 rounded-lg py-2 text-sm text-blue-600 hover:bg-blue-50 font-semibold"
          >
            + Add Call Time
          </button>
        </div>
      </SectionModal>

      {/* Talent Calls + BG Calls Modal */}
      <SectionModal
        open={activeModal === 'talentCalls'}
        onClose={() => setActiveModal(null)}
        title="Talent Calls & BG Calls"
      >
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-gray-600">Talent Calls</h3>
          {schedule.talentCalls.map((tc) => (
            <div key={tc.id} className="flex items-center gap-2">
              <input
                type="text"
                value={tc.label}
                onChange={(e) => updateTalentCall(tc.id, { label: e.target.value })}
                placeholder="Label"
                className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
              />
              <input
                type="text"
                value={tc.time}
                onChange={(e) => updateTalentCall(tc.id, { time: e.target.value })}
                placeholder="Time"
                className="w-28 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400 font-semibold"
              />
              <button
                onClick={() => removeTalentCall(tc.id)}
                className="text-red-500 hover:text-red-700 text-xs shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addTalentCall}
            className="w-full border border-dashed border-gray-300 rounded-lg py-2 text-sm text-blue-600 hover:bg-blue-50 font-semibold"
          >
            + Add Talent Call
          </button>

          <hr className="my-2" />
          <h3 className="text-xs font-bold uppercase text-gray-600">BG Calls</h3>
          {schedule.bgCalls.map((bc) => (
            <div key={bc.id} className="flex items-center gap-2">
              <input
                type="text"
                value={bc.label}
                onChange={(e) => updateBgCall(bc.id, { label: e.target.value })}
                placeholder="Label"
                className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
              />
              <input
                type="text"
                value={bc.time}
                onChange={(e) => updateBgCall(bc.id, { time: e.target.value })}
                placeholder="Time"
                className="w-28 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400 font-semibold"
              />
              <button
                onClick={() => removeBgCall(bc.id)}
                className="text-red-500 hover:text-red-700 text-xs shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addBgCall}
            className="w-full border border-dashed border-gray-300 rounded-lg py-2 text-sm text-blue-600 hover:bg-blue-50 font-semibold"
          >
            + Add BG Call
          </button>
        </div>
      </SectionModal>

      {/* Director / Date / Weather Modal */}
      <SectionModal
        open={activeModal === 'director'}
        onClose={() => setActiveModal(null)}
        title="Director & Date Info"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Director</label>
            <input
              type="text"
              value={schedule.director}
              onChange={(e) => updateField('director', e.target.value)}
              placeholder="Director Name"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Sunrise</label>
              <input
                type="text"
                value={schedule.sunrise}
                onChange={(e) => updateField('sunrise', e.target.value)}
                placeholder="e.g. 6:55A"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Sunset</label>
              <input
                type="text"
                value={schedule.sunset}
                onChange={(e) => updateField('sunset', e.target.value)}
                placeholder="e.g. 6:50P"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Weather</label>
            <input
              type="text"
              value={schedule.weather}
              onChange={(e) => updateField('weather', e.target.value)}
              placeholder="e.g. Mostly Sunny"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </SectionModal>

      {/* Hospital Modal */}
      <SectionModal
        open={activeModal === 'hospital'}
        onClose={() => setActiveModal(null)}
        title="Hospital"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Hospital Name</label>
            <input
              type="text"
              value={schedule.hospitalName}
              onChange={(e) => updateField('hospitalName', e.target.value)}
              placeholder="Hospital Name"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Department</label>
            <input
              type="text"
              value={schedule.hospitalDepartment}
              onChange={(e) => updateField('hospitalDepartment', e.target.value)}
              placeholder="e.g. Midtown - Emergency"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Address</label>
            <input
              type="text"
              value={schedule.hospitalAddress}
              onChange={(e) => updateField('hospitalAddress', e.target.value)}
              placeholder="Full address with city/state/zip"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Phone</label>
            <input
              type="text"
              value={schedule.hospitalPhone}
              onChange={(e) => updateField('hospitalPhone', e.target.value)}
              placeholder="Phone number"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </SectionModal>
    </>
  );
}

/** Large, prominent red medical cross icon matching Canva examples */
function HospitalIcon() {
  return (
    <div
      className="shrink-0 flex items-center justify-center rounded-md"
      style={{
        width: 38,
        height: 38,
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="10" y="2" width="8" height="24" rx="1.5" fill="#dc2626" />
        <rect x="2" y="10" width="24" height="8" rx="1.5" fill="#dc2626" />
      </svg>
    </div>
  );
}

/** Logo resize drag handle */
function LogoResizeHandle() {
  const { schedule, updateField } = useScheduleStore();
  const dragging = useRef(false);
  const startY = useRef(0);
  const startScale = useRef(1);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragging.current = true;
    startY.current = e.clientY;
    startScale.current = schedule.logoScale;

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = (startY.current - ev.clientY) / 100;
      const newScale = Math.min(2.0, Math.max(0.5, startScale.current + delta));
      updateField('logoScale', Math.round(newScale * 100) / 100);
    };

    const handleMouseUp = () => {
      dragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [schedule.logoScale, updateField]);

  return (
    <div
      className="absolute bottom-1 left-1/2 -translate-x-1/2 cursor-ns-resize opacity-0 hover:opacity-100 transition-opacity"
      data-export-hide
      onMouseDown={handleMouseDown}
    >
      <div className="flex flex-col items-center gap-0.5 px-2 py-0.5 bg-gray-200/80 rounded text-[8px] text-gray-500 select-none">
        <div className="w-4 h-0.5 bg-gray-400 rounded" />
        <div className="w-4 h-0.5 bg-gray-400 rounded" />
      </div>
    </div>
  );
}

/** Logo upload slot for the modal */
function LogoModalSlot({
  logo,
  onRemove,
}: {
  logo: { id: string; url: string; name: string };
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { updateField, schedule } = useScheduleStore();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const updated = schedule.logos.map((l) =>
        l.id === logo.id ? { ...l, url, name: file.name } : l
      );
      updateField('logos', updated);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">{logo.name || 'No file selected'}</span>
        <button
          onClick={onRemove}
          className="text-xs text-red-500 hover:text-red-700"
        >
          Remove
        </button>
      </div>
      {logo.url ? (
        <div className="flex items-center gap-3">
          <img
            src={logo.url}
            alt={logo.name}
            className="max-h-16 max-w-[120px] object-contain"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Replace
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border border-dashed border-gray-400 rounded p-4 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-400"
        >
          Click to upload logo
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}
