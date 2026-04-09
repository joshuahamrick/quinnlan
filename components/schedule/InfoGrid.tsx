'use client';

import { useRef, useState } from 'react';
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
      {/* Info Grid — matches Canva reference layout */}
      <div className="grid grid-cols-[14%_18%_16%_20%_32%] border border-gray-300 text-[10px] leading-tight">
        {/* CONTACTS */}
        <div
          className="border-r border-gray-300 p-2 flex flex-col justify-center cursor-pointer hover:bg-blue-50/40 transition-colors"
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

        {/* LOGOS */}
        <div
          className="border-r border-gray-300 p-2 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-50/40 transition-colors"
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
                  className="max-h-24 max-w-full object-contain"
                />
              ))
          ) : (
            <div className="text-gray-400 italic text-[9px]">Click to add logos</div>
          )}
        </div>

        {/* CALL TIMES */}
        <div
          className="border-r border-gray-300 p-2 cursor-pointer hover:bg-blue-50/40 transition-colors"
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

        {/* RIGHT SECTION: Talent Calls + BG Calls / Director+Date / Hospital */}
        <div className="border-r border-gray-300 flex flex-col">
          {/* TALENT CALLS + BG CALLS */}
          <div
            className="p-2 flex-1 border-b border-gray-300 cursor-pointer hover:bg-blue-50/40 transition-colors"
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

          {/* HOSPITAL */}
          <div
            className="p-2 cursor-pointer hover:bg-blue-50/40 transition-colors"
            onClick={() => setActiveModal('hospital')}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <HospitalIcon />
              <span className="font-extrabold text-[10px] uppercase">Hospital:</span>
            </div>
            {schedule.hospitalName ? (
              <div>
                <div className="font-semibold">{schedule.hospitalName}</div>
                {schedule.hospitalAddress && <div>{schedule.hospitalAddress}</div>}
                {schedule.hospitalPhone && <div>{schedule.hospitalPhone}</div>}
              </div>
            ) : (
              <div className="text-gray-400 italic text-[9px]">Click to add hospital</div>
            )}
          </div>
        </div>

        {/* DIRECTOR + DATE + WEATHER */}
        <div className="flex flex-col">
          <div
            className="p-2 flex-1 cursor-pointer hover:bg-blue-50/40 transition-colors"
            onClick={() => setActiveModal('director')}
          >
            <div className="font-extrabold text-[10px] uppercase mb-1">Director</div>
            {schedule.director ? (
              <div className="font-semibold">{schedule.director}</div>
            ) : (
              <div className="text-gray-400 italic text-[9px]">Click to set</div>
            )}
            <div className="mt-2 space-y-0.5">
              {schedule.date && (
                <div className="font-extrabold uppercase text-[9px]">{schedule.date}</div>
              )}
              {schedule.sunrise && (
                <div><span className="font-semibold">Sunrise:</span> {schedule.sunrise}{schedule.sunset ? ` | Sunset: ${schedule.sunset}` : ''}</div>
              )}
              {schedule.weather && (
                <div><span className="font-semibold">Weather:</span> {schedule.weather}</div>
              )}
              {!schedule.date && !schedule.sunrise && !schedule.weather && (
                <div className="text-gray-400 italic text-[9px]">Click to set date/weather</div>
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
              value="Emergency Room"
              readOnly
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Address</label>
            <input
              type="text"
              value={schedule.hospitalAddress}
              onChange={(e) => updateField('hospitalAddress', e.target.value)}
              placeholder="Full address"
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

/** Red medical cross icon matching Canva examples */
function HospitalIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <rect width="18" height="18" rx="2" fill="white" stroke="#dc2626" strokeWidth="1" />
      <path
        d="M7 3h4v4h4v4h-4v4H7v-4H3V7h4V3z"
        fill="#dc2626"
      />
    </svg>
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
