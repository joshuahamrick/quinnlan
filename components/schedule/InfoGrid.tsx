'use client';

import { useRef } from 'react';
import { useScheduleStore } from '@/lib/store';
import EditableText from './EditableText';

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
  } = useScheduleStore();

  return (
    <div className="grid grid-cols-6 border border-gray-300 text-xs">
      {/* CONTACTS */}
      <div className="border-r border-gray-300 p-2 col-span-1">
        <div className="font-bold text-[10px] uppercase mb-1">Contacts:</div>
        {schedule.contacts.map((c) => (
          <div key={c.id} className="mb-1 group relative">
            <div className="flex items-start gap-0.5">
              <div className="flex-1 min-w-0">
                <EditableText
                  value={c.title}
                  onChange={(v) => updateContact(c.id, { title: v })}
                  placeholder="Title"
                  className="font-semibold text-[10px] italic"
                />
                <br />
                <EditableText
                  value={c.name}
                  onChange={(v) => updateContact(c.id, { name: v })}
                  placeholder="Name"
                  className="text-[10px]"
                />
                <br />
                <EditableText
                  value={c.phone}
                  onChange={(v) => updateContact(c.id, { phone: v })}
                  placeholder="Phone"
                  className="text-[10px]"
                />
              </div>
              <button
                onClick={() => removeContact(c.id)}
                className="text-red-400 hover:text-red-600 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                x
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={addContact}
          className="text-blue-500 hover:text-blue-700 text-[10px] font-bold mt-1"
        >
          + Add Contact
        </button>
      </div>

      {/* LOGOS */}
      <div className="border-r border-gray-300 p-2 col-span-1 flex flex-col items-center justify-center gap-2">
        {schedule.logos.map((logo) => (
          <LogoSlot key={logo.id} logo={logo} onRemove={() => removeLogo(logo.id)} />
        ))}
        {schedule.logos.length < 3 && (
          <button
            onClick={addLogo}
            className="text-blue-500 hover:text-blue-700 text-[10px] font-bold"
          >
            + Add Logo
          </button>
        )}
      </div>

      {/* CALL TIMES */}
      <div className="border-r border-gray-300 p-2 col-span-1">
        {schedule.callTimes.map((ct) => (
          <div key={ct.id} className="flex items-center gap-0.5 mb-0.5 group">
            <EditableText
              value={ct.time}
              onChange={(v) => updateCallTime(ct.id, { time: v })}
              placeholder="Time"
              className="text-[10px] font-semibold"
            />
            <span className="text-[10px]">:</span>
            <EditableText
              value={ct.label}
              onChange={(v) => updateCallTime(ct.id, { label: v })}
              placeholder="Label"
              className="text-[10px]"
            />
            <button
              onClick={() => removeCallTime(ct.id)}
              className="text-red-400 hover:text-red-600 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              x
            </button>
          </div>
        ))}
        <button
          onClick={addCallTime}
          className="text-blue-500 hover:text-blue-700 text-[10px] font-bold"
        >
          +
        </button>
      </div>

      {/* TALENT CALLS */}
      <div className="border-r border-gray-300 p-2 col-span-1">
        <div className="font-bold text-[10px] uppercase mb-1">Talent Calls:</div>
        {schedule.talentCalls.map((tc) => (
          <div key={tc.id} className="flex items-center gap-0.5 mb-0.5 group">
            <EditableText
              value={tc.label}
              onChange={(v) => updateTalentCall(tc.id, { label: v })}
              placeholder="Label"
              className="text-[10px]"
            />
            <EditableText
              value={tc.time}
              onChange={(v) => updateTalentCall(tc.id, { time: v })}
              placeholder="Time"
              className="text-[10px] font-semibold"
            />
            <button
              onClick={() => removeTalentCall(tc.id)}
              className="text-red-400 hover:text-red-600 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              x
            </button>
          </div>
        ))}
        <button
          onClick={addTalentCall}
          className="text-blue-500 hover:text-blue-700 text-[10px] font-bold"
        >
          +
        </button>
      </div>

      {/* DIRECTOR + DATE INFO */}
      <div className="border-r border-gray-300 p-2 col-span-1">
        <div className="font-bold text-[10px] uppercase mb-1">Director</div>
        <EditableText
          value={schedule.director}
          onChange={(v) => updateField('director', v)}
          placeholder="Director Name"
          className="text-[10px]"
        />
        <div className="mt-2 text-[10px] space-y-0.5">
          <div>
            <span className="font-semibold">Sunrise: </span>
            <EditableText
              value={schedule.sunrise}
              onChange={(v) => updateField('sunrise', v)}
              placeholder="Time"
              className="text-[10px]"
            />
          </div>
          <div>
            <span className="font-semibold">Sunset: </span>
            <EditableText
              value={schedule.sunset}
              onChange={(v) => updateField('sunset', v)}
              placeholder="Time"
              className="text-[10px]"
            />
          </div>
          <div>
            <span className="font-semibold">Weather: </span>
            <EditableText
              value={schedule.weather}
              onChange={(v) => updateField('weather', v)}
              placeholder="Weather"
              className="text-[10px]"
            />
          </div>
        </div>
      </div>

      {/* HOSPITAL */}
      <div className="p-2 col-span-1">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-red-600 font-bold text-sm">+</span>
          <span className="font-bold text-[10px] uppercase">Hospital:</span>
        </div>
        <EditableText
          value={schedule.hospitalName}
          onChange={(v) => updateField('hospitalName', v)}
          placeholder="Hospital Name"
          className="text-[10px] font-semibold"
        />
        <br />
        <EditableText
          value={schedule.hospitalAddress}
          onChange={(v) => updateField('hospitalAddress', v)}
          placeholder="Address"
          className="text-[10px]"
        />
        <br />
        <EditableText
          value={schedule.hospitalPhone}
          onChange={(v) => updateField('hospitalPhone', v)}
          placeholder="Phone"
          className="text-[10px]"
        />
      </div>
    </div>
  );
}

function LogoSlot({
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
    <div className="relative group">
      {logo.url ? (
        <img
          src={logo.url}
          alt={logo.name}
          className="max-h-12 max-w-full object-contain cursor-pointer"
          onClick={() => fileRef.current?.click()}
        />
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="border border-dashed border-gray-400 rounded p-2 text-[10px] text-gray-400 hover:border-blue-400 hover:text-blue-400"
        >
          + Logo
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
      {logo.url && (
        <button
          onClick={onRemove}
          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3 text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          x
        </button>
      )}
    </div>
  );
}
