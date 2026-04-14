'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useScheduleStore } from '@/lib/store';
import { compressImage } from '@/lib/images';
import SectionModal from './SectionModal';
import AddressAutocomplete from './AddressAutocomplete';
import TimeInput from './TimeInput';

type ModalType = 'contacts' | 'logos' | 'callTimes' | 'talentCalls' | 'director' | 'hospital' | null;

export default function InfoGrid() {
  const {
    schedule,
    updateField,
    addContact,
    removeContact,
    updateContact,
    reorderContacts,
    addLogo,
    removeLogo,
    reorderLogos,
    addCallTime,
    removeCallTime,
    updateCallTime,
    reorderCallTimes,
    addTalentCall,
    removeTalentCall,
    updateTalentCall,
    reorderTalentCalls,
    addBgCall,
    removeBgCall,
    updateBgCall,
  } = useScheduleStore();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const logoIsDragging = useRef(false);
  const [logoDragIndex, setLogoDragIndex] = useState<number | null>(null);
  const [logoDropTarget, setLogoDropTarget] = useState<number | null>(null);
  const [logoDropZoneActive, setLogoDropZoneActive] = useState(false);
  const [callTimeDragIndex, setCallTimeDragIndex] = useState<number | null>(null);
  const [callTimeDropTarget, setCallTimeDropTarget] = useState<number | null>(null);
  const [contactDragIndex, setContactDragIndex] = useState<number | null>(null);
  const [contactDropTarget, setContactDropTarget] = useState<number | null>(null);
  const [talentCallDragIndex, setTalentCallDragIndex] = useState<number | null>(null);
  const [talentCallDropTarget, setTalentCallDropTarget] = useState<number | null>(null);
  const [gridContactDragIndex, setGridContactDragIndex] = useState<number | null>(null);
  const [gridContactDropTarget, setGridContactDropTarget] = useState<number | null>(null);
  const [gridCallTimeDragIndex, setGridCallTimeDragIndex] = useState<number | null>(null);
  const [gridCallTimeDropTarget, setGridCallTimeDropTarget] = useState<number | null>(null);
  const contactWasDragging = useRef(false);
  const callTimeWasDragging = useRef(false);
  const [contactPreviewOrder, setContactPreviewOrder] = useState<string[] | null>(null);
  const [callTimePreviewOrder, setCallTimePreviewOrder] = useState<string[] | null>(null);

  const handleLogoDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLogoDropZoneActive(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const raw = reader.result as string;
      const url = await compressImage(raw);
      const newId = crypto.randomUUID();
      updateField('logos', [...schedule.logos, { id: newId, url, name: file.name }]);
    };
    reader.readAsDataURL(file);
  }, [schedule.logos, updateField]);

  const gridRef = useRef<HTMLDivElement>(null);
  const cols = schedule.infoGridColumns ?? [15, 25, 18, 16, 26];
  const rightColSplit = [cols[3], cols[4]];

  return (
    <>
      {/* Info Grid — 5-column CSS grid matching Canva reference layout */}
      <div
        ref={gridRef}
        data-schedule-row
        className="border border-gray-300 text-[10px] leading-tight relative"
        style={{
          display: 'grid',
          gridTemplateColumns: cols.map((c) => `${c}%`).join(' '),
          gridTemplateRows: 'auto auto',
        }}
      >
        {/* CONTACTS — full height, centered */}
        <div
          className="border-r border-gray-300 p-2 flex flex-col hover:bg-blue-50/40 transition-colors"
          style={{ gridRow: '1 / 3' }}
        >
          <div className="font-extrabold text-[10px] uppercase mb-1 cursor-pointer" onClick={() => setActiveModal('contacts')}>Contacts:</div>
          <div className="flex-1 flex flex-col justify-center text-left gap-5">
            {(() => {
              const displayContacts = contactPreviewOrder
                ? contactPreviewOrder.map(id => schedule.contacts.find(c => c.id === id)!).filter(Boolean)
                : schedule.contacts;
              return displayContacts.map((c, index) => {
                const isDragged = gridContactDragIndex !== null && c.id === schedule.contacts[gridContactDragIndex]?.id;
                return (
                  <div key={c.id}>
                    <div
                      className={`space-y-0 leading-relaxed text-left cursor-default transition-opacity duration-200 ${isDragged ? 'opacity-20' : ''}`}
                      draggable
                      onDragStart={(e) => {
                        contactWasDragging.current = true;
                        const origIndex = schedule.contacts.findIndex(sc => sc.id === c.id);
                        setGridContactDragIndex(origIndex);
                        setContactPreviewOrder(schedule.contacts.map(sc => sc.id));
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (gridContactDragIndex !== null) {
                          const dragId = schedule.contacts[gridContactDragIndex].id;
                          setContactPreviewOrder(prev => {
                            if (!prev) return prev;
                            const currentPos = prev.indexOf(dragId);
                            if (currentPos === index) return prev;
                            const next = prev.filter(id => id !== dragId);
                            next.splice(index, 0, dragId);
                            return next;
                          });
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (gridContactDragIndex !== null && contactPreviewOrder) {
                          const dragId = schedule.contacts[gridContactDragIndex].id;
                          const toIndex = contactPreviewOrder.indexOf(dragId);
                          if (gridContactDragIndex !== toIndex) {
                            reorderContacts(gridContactDragIndex, toIndex);
                          }
                        }
                        setGridContactDragIndex(null);
                        setContactPreviewOrder(null);
                      }}
                      onDragEnd={() => {
                        setGridContactDragIndex(null);
                        setContactPreviewOrder(null);
                        setTimeout(() => { contactWasDragging.current = false; }, 0);
                      }}
                      onClick={() => { if (!contactWasDragging.current) setActiveModal('contacts'); }}
                    >
                        {c.title && <div className="font-semibold text-[10px]">{c.title}</div>}
                        {c.name && <div className="text-[10px]">{c.name}</div>}
                        {c.phone && <div className="text-[10px]">{c.phone}</div>}
                    </div>
                  </div>
                );
              });
            })()}
            {schedule.contacts.length === 0 && (
              <div className="text-gray-400 italic text-[9px] cursor-pointer" data-export-hide onClick={() => setActiveModal('contacts')}>Click to add contacts</div>
            )}
          </div>
        </div>

        {/* LOGOS — full height, centered, with resize */}
        <div
          className={`group/logos border-r border-gray-300 p-2 flex flex-row flex-wrap items-center justify-center gap-2 cursor-pointer hover:bg-blue-50/40 transition-colors relative ${logoDropZoneActive ? 'border-2 border-dashed border-blue-400 bg-blue-50' : ''}`}
          style={{ gridRow: '1 / 3' }}
          onClick={() => { if (!logoIsDragging.current) setActiveModal('logos'); }}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setLogoDropZoneActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setLogoDropZoneActive(false); }}
          onDrop={handleLogoDrop}
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
                    maxHeight: `${96 * (schedule.logoScale ?? 1)}px`,
                  }}
                />
              ))
          ) : (
            <div className="text-gray-400 italic text-[9px]" data-export-hide>Click to add logos</div>
          )}
          {schedule.logos.filter((l) => l.url).length > 0 && (
            <LogoResizeHandle isDraggingRef={logoIsDragging} />
          )}
        </div>

        {/* CALL TIMES — full height */}
        <div
          className="border-r border-gray-300 p-2 flex flex-col justify-evenly hover:bg-blue-50/40 transition-colors"
          style={{ gridRow: '1 / 3' }}
        >
          {(() => {
            const displayCallTimes = callTimePreviewOrder
              ? callTimePreviewOrder.map(id => schedule.callTimes.find(ct => ct.id === id)!).filter(Boolean)
              : schedule.callTimes;
            return displayCallTimes.map((ct, index) => {
              const hasTime = ct.time.trim() !== '';
              const hasLabel = ct.label.trim() !== '';
              const isDragged = gridCallTimeDragIndex !== null && ct.id === schedule.callTimes[gridCallTimeDragIndex]?.id;
              return (
                <div key={ct.id}>
                  <div
                    className={`cursor-default transition-opacity duration-200 ${isDragged ? 'opacity-20' : ''}`}
                    draggable
                    onDragStart={(e) => {
                      callTimeWasDragging.current = true;
                      const origIndex = schedule.callTimes.findIndex(sct => sct.id === ct.id);
                      setGridCallTimeDragIndex(origIndex);
                      setCallTimePreviewOrder(schedule.callTimes.map(sct => sct.id));
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (gridCallTimeDragIndex !== null) {
                        const dragId = schedule.callTimes[gridCallTimeDragIndex].id;
                        setCallTimePreviewOrder(prev => {
                          if (!prev) return prev;
                          const currentPos = prev.indexOf(dragId);
                          if (currentPos === index) return prev;
                          const next = prev.filter(id => id !== dragId);
                          next.splice(index, 0, dragId);
                          return next;
                        });
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (gridCallTimeDragIndex !== null && callTimePreviewOrder) {
                        const dragId = schedule.callTimes[gridCallTimeDragIndex].id;
                        const toIndex = callTimePreviewOrder.indexOf(dragId);
                        if (gridCallTimeDragIndex !== toIndex) {
                          reorderCallTimes(gridCallTimeDragIndex, toIndex);
                        }
                      }
                      setGridCallTimeDragIndex(null);
                      setCallTimePreviewOrder(null);
                    }}
                    onDragEnd={() => {
                      setGridCallTimeDragIndex(null);
                      setCallTimePreviewOrder(null);
                      setTimeout(() => { callTimeWasDragging.current = false; }, 0);
                    }}
                    onClick={() => { if (!callTimeWasDragging.current) setActiveModal('callTimes'); }}
                  >
                      {hasTime && hasLabel ? (
                        <span>
                          <span className="font-semibold">{ct.time}:</span> {ct.label}
                        </span>
                      ) : hasTime ? (
                        <span>
                          <span className="font-semibold">{ct.time}:</span>
                        </span>
                      ) : hasLabel ? (
                        <span className="text-gray-300 italic">
                          {ct.label}
                        </span>
                      ) : (
                        <span className="text-gray-300 italic" data-export-hide>—</span>
                      )}
                  </div>
                </div>
              );
            });
          })()}
          {schedule.callTimes.length === 0 && (
            <div className="text-gray-400 italic text-[9px] cursor-pointer" data-export-hide onClick={() => setActiveModal('callTimes')}>Click to add call times</div>
          )}
        </div>

        {/* RIGHT COLUMNS (4-5) — nested grid with draggable hospital split */}
        <div
          className="relative"
          style={{
            gridColumn: '4 / 6',
            gridRow: '1 / 3',
            display: 'grid',
            gridTemplateColumns: `${rightColSplit[0]}fr ${rightColSplit[1]}fr`,
            gridTemplateRows: `${schedule.hospitalSplitPercent ?? 70}% ${100 - (schedule.hospitalSplitPercent ?? 70)}%`,
          }}
        >
          {/* TALENT CALLS + BG CALLS — top-left of right section */}
          <div
            className="border-r border-gray-300 border-b border-gray-300 p-2 cursor-pointer hover:bg-blue-50/40 transition-colors overflow-hidden"
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
              <div className="text-gray-400 italic text-[9px]" data-export-hide>Click to add</div>
            )}
          </div>

          {/* DIRECTOR + SHOOTING LOCATION + DAY + DATE/WEATHER — top-right of right section */}
          <div
            className="p-2 border-b border-gray-300 cursor-pointer hover:bg-blue-50/40 transition-colors overflow-hidden"
            onClick={() => setActiveModal('director')}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto', gap: '0' }}>
              {/* Top-left: Director */}
              <div>
                <div className="font-extrabold text-[10px] uppercase mb-0.5">Director</div>
                {schedule.director ? (
                  <div className="font-semibold">{schedule.director}</div>
                ) : (
                  <div className="text-gray-400 italic text-[9px]" data-export-hide>Click to set</div>
                )}
              </div>
              {/* Top-right: Shooting Location */}
              <div className="text-right">
                <div className="font-extrabold text-[10px] uppercase mb-0.5">Shooting Location</div>
                {schedule.shootingLocation ? (
                  <div>{schedule.shootingLocation}</div>
                ) : (
                  <div className="text-gray-400 italic text-[9px]" data-export-hide>Click to set</div>
                )}
              </div>
              {/* Bottom-left: Day X of Y */}
              <div className="mt-2 flex items-end">
                {(schedule.dayNumber || schedule.totalDays) && (
                  <div className="font-semibold">Day {schedule.dayNumber} of {schedule.totalDays}</div>
                )}
              </div>
              {/* Bottom-right: Date, Sunrise/Sunset, Weather */}
              <div className="mt-2 space-y-0.5 text-right">
                {schedule.date ? (
                  <div className="font-extrabold uppercase text-[9px]">{schedule.date}</div>
                ) : (
                  <div className="text-gray-400 italic text-[9px]" data-export-hide>Date</div>
                )}
                {schedule.sunrise || schedule.sunset ? (
                  <div>Sunrise: {schedule.sunrise || '—'} | Sunset: {schedule.sunset || '—'}</div>
                ) : (
                  <div className="text-gray-400 italic text-[9px]" data-export-hide>Sunrise/Sunset</div>
                )}
                {schedule.weather ? (
                  <div className="whitespace-pre-wrap">{schedule.weather}</div>
                ) : (
                  <div className="text-gray-400 italic text-[9px]" data-export-hide>Weather</div>
                )}
              </div>
            </div>
          </div>

          {/* HOSPITAL — spans bottom of both right columns */}
          <div
            className="p-2 cursor-pointer hover:bg-blue-50/40 transition-colors overflow-hidden"
            style={{ gridColumn: '1 / 3' }}
            onClick={() => setActiveModal('hospital')}
          >
            <div className="flex items-start gap-3">
              <HospitalIcon />
              <div className="flex-1 min-w-0">
                {schedule.hospitalName ? (
                  <div>
                    <div className="font-extrabold text-[10px] uppercase mb-0.5">Hospital:</div>
                    <div className="font-bold text-[10px]">{schedule.hospitalName}</div>
                    {schedule.hospitalDepartment && (
                      <div className="text-[9px]">{schedule.hospitalDepartment}</div>
                    )}
                    {schedule.hospitalAddress && <div className="text-[9px]">{schedule.hospitalAddress}</div>}
                    {schedule.hospitalPhone && <div className="text-[9px]">{schedule.hospitalPhone}</div>}
                  </div>
                ) : (
                  <div>
                    <div className="font-extrabold text-[10px] uppercase mb-0.5">Hospital:</div>
                    <div className="text-gray-400 italic text-[9px]" data-export-hide>Click to add hospital</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hospital split drag handle */}
          <HospitalSplitHandle />
        </div>

        {/* Column resize handles */}
        {[0, 1, 2, 3].map((i) => (
          <ColumnResizeHandle
            key={i}
            colIndex={i}
            columns={cols}
            gridRef={gridRef}
          />
        ))}
      </div>

      {/* ---- MODALS ---- */}

      {/* Contacts Modal */}
      <SectionModal
        open={activeModal === 'contacts'}
        onClose={() => setActiveModal(null)}
        title="Contacts"
      >
        <div className="space-y-1">
          {schedule.contacts.map((c, index) => (
            <div key={c.id}>
              {contactDropTarget === index && contactDragIndex !== index && contactDragIndex !== index - 1 && (
                <div className="h-0.5 bg-blue-500 rounded-full mx-3 my-1" />
              )}
              <div
                draggable
                onDragStart={(e) => {
                  setContactDragIndex(index);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setContactDropTarget(index);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (contactDragIndex !== null && contactDragIndex !== index) {
                    reorderContacts(contactDragIndex, index);
                  }
                  setContactDragIndex(null);
                  setContactDropTarget(null);
                }}
                onDragEnd={() => {
                  setContactDragIndex(null);
                  setContactDropTarget(null);
                }}
                className={`border border-gray-200 rounded-lg p-3 space-y-2 ${contactDragIndex === index ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 shrink-0">
                      <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor">
                        <circle cx="2" cy="2" r="1.5" />
                        <circle cx="6" cy="2" r="1.5" />
                        <circle cx="2" cy="7" r="1.5" />
                        <circle cx="6" cy="7" r="1.5" />
                        <circle cx="2" cy="12" r="1.5" />
                        <circle cx="6" cy="12" r="1.5" />
                      </svg>
                    </div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Title</label>
                  </div>
                  <button
                    onClick={() => removeContact(c.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                    tabIndex={-1}
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
              {contactDropTarget === schedule.contacts.length - 1 && index === schedule.contacts.length - 1 && contactDragIndex !== index && (
                <div className="h-0.5 bg-blue-500 rounded-full mx-3 my-1" />
              )}
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
        <div className="space-y-1">
          {schedule.logos.map((logo, index) => (
            <div key={logo.id}>
              {logoDropTarget === index && logoDragIndex !== index && logoDragIndex !== index - 1 && (
                <div className="h-0.5 bg-blue-500 rounded-full mx-3 my-1" />
              )}
              <div
                draggable
                onDragStart={(e) => {
                  setLogoDragIndex(index);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setLogoDropTarget(index);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (logoDragIndex !== null && logoDragIndex !== index) {
                    reorderLogos(logoDragIndex, index);
                  }
                  setLogoDragIndex(null);
                  setLogoDropTarget(null);
                }}
                onDragEnd={() => {
                  setLogoDragIndex(null);
                  setLogoDropTarget(null);
                }}
                className={`flex items-center gap-2 ${logoDragIndex === index ? 'opacity-40' : ''}`}
              >
                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 shrink-0 px-1">
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor">
                    <circle cx="2" cy="2" r="1.5" />
                    <circle cx="6" cy="2" r="1.5" />
                    <circle cx="2" cy="7" r="1.5" />
                    <circle cx="6" cy="7" r="1.5" />
                    <circle cx="2" cy="12" r="1.5" />
                    <circle cx="6" cy="12" r="1.5" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <LogoModalSlot logo={logo} onRemove={() => removeLogo(logo.id)} />
                </div>
              </div>
              {logoDropTarget === schedule.logos.length - 1 && index === schedule.logos.length - 1 && logoDragIndex !== index && (
                <div className="h-0.5 bg-blue-500 rounded-full mx-3 my-1" />
              )}
            </div>
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
        <div className="space-y-1">
          {schedule.callTimes.map((ct, index) => (
            <div key={ct.id}>
              {callTimeDropTarget === index && callTimeDragIndex !== index && callTimeDragIndex !== index - 1 && (
                <div className="h-0.5 bg-blue-500 rounded-full mx-3 my-1" />
              )}
              <div
                draggable
                onDragStart={(e) => {
                  setCallTimeDragIndex(index);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setCallTimeDropTarget(index);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (callTimeDragIndex !== null && callTimeDragIndex !== index) {
                    reorderCallTimes(callTimeDragIndex, index);
                  }
                  setCallTimeDragIndex(null);
                  setCallTimeDropTarget(null);
                }}
                onDragEnd={() => {
                  setCallTimeDragIndex(null);
                  setCallTimeDropTarget(null);
                }}
                className={`flex items-center gap-2 ${callTimeDragIndex === index ? 'opacity-40' : ''}`}
              >
                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 shrink-0 px-1">
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor">
                    <circle cx="2" cy="2" r="1.5" />
                    <circle cx="6" cy="2" r="1.5" />
                    <circle cx="2" cy="7" r="1.5" />
                    <circle cx="6" cy="7" r="1.5" />
                    <circle cx="2" cy="12" r="1.5" />
                    <circle cx="6" cy="12" r="1.5" />
                  </svg>
                </div>
                <TimeInput
                  value={ct.time}
                  onChange={(v) => updateCallTime(ct.id, { time: v })}
                  placeholder="Time (e.g. 7:30A)"
                  className="w-28 text-sm font-semibold"
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
                  tabIndex={-1}
                >
                  Remove
                </button>
              </div>
              {callTimeDropTarget === schedule.callTimes.length - 1 && index === schedule.callTimes.length - 1 && callTimeDragIndex !== index && (
                <div className="h-0.5 bg-blue-500 rounded-full mx-3 my-1" />
              )}
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
          <div className="space-y-1">
            {schedule.talentCalls.map((tc, index) => (
              <div key={tc.id}>
                {talentCallDropTarget === index && talentCallDragIndex !== index && talentCallDragIndex !== index - 1 && (
                  <div className="h-0.5 bg-blue-500 rounded-full mx-3 my-1" />
                )}
                <div
                  draggable
                  onDragStart={(e) => {
                    setTalentCallDragIndex(index);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    setTalentCallDropTarget(index);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (talentCallDragIndex !== null && talentCallDragIndex !== index) {
                      reorderTalentCalls(talentCallDragIndex, index);
                    }
                    setTalentCallDragIndex(null);
                    setTalentCallDropTarget(null);
                  }}
                  onDragEnd={() => {
                    setTalentCallDragIndex(null);
                    setTalentCallDropTarget(null);
                  }}
                  className={`flex items-center gap-2 ${talentCallDragIndex === index ? 'opacity-40' : ''}`}
                >
                  <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 shrink-0 px-1">
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor">
                      <circle cx="2" cy="2" r="1.5" />
                      <circle cx="6" cy="2" r="1.5" />
                      <circle cx="2" cy="7" r="1.5" />
                      <circle cx="6" cy="7" r="1.5" />
                      <circle cx="2" cy="12" r="1.5" />
                      <circle cx="6" cy="12" r="1.5" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={tc.label}
                    onChange={(e) => updateTalentCall(tc.id, { label: e.target.value })}
                    placeholder="Label"
                    className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                  />
                  <TimeInput
                    value={tc.time}
                    onChange={(v) => updateTalentCall(tc.id, { time: v })}
                    placeholder="Time"
                    className="w-28 text-sm font-semibold"
                  />
                  <button
                    onClick={() => removeTalentCall(tc.id)}
                    className="text-red-500 hover:text-red-700 text-xs shrink-0"
                    tabIndex={-1}
                  >
                    Remove
                  </button>
                </div>
                {talentCallDropTarget === schedule.talentCalls.length - 1 && index === schedule.talentCalls.length - 1 && talentCallDragIndex !== index && (
                  <div className="h-0.5 bg-blue-500 rounded-full mx-3 my-1" />
                )}
              </div>
            ))}
          </div>
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
              <TimeInput
                value={bc.time}
                onChange={(v) => updateBgCall(bc.id, { time: v })}
                placeholder="Time"
                className="w-28 text-sm font-semibold"
              />
              <button
                onClick={() => removeBgCall(bc.id)}
                className="text-red-500 hover:text-red-700 text-xs shrink-0"
                tabIndex={-1}
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
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Shooting Location</label>
            <AddressAutocomplete
              value={schedule.shootingLocation}
              onChange={(val) => updateField('shootingLocation', val)}
              onCoordinates={(lat, lon) => {
                updateField('shootingLat', lat);
                updateField('shootingLon', lon);
              }}
              placeholder="e.g. Starlight Studios, Stage 4"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Date</label>
            <input
              type="text"
              value={schedule.date}
              onChange={(e) => updateField('date', e.target.value)}
              placeholder="e.g. Thursday, March 19th"
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Day Number</label>
              <input
                type="number"
                min={1}
                value={schedule.dayNumber}
                onChange={(e) => updateField('dayNumber', parseInt(e.target.value) || 1)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Total Days</label>
              <input
                type="number"
                min={1}
                value={schedule.totalDays}
                onChange={(e) => updateField('totalDays', parseInt(e.target.value) || 1)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
              />
            </div>
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
    <div className="shrink-0 flex items-center justify-center" style={{ width: 40, height: 40 }}>
      <svg
        width="38"
        height="38"
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="13" y="2" width="12" height="34" rx="1.5" fill="#dc2626" />
        <rect x="2" y="13" width="34" height="12" rx="1.5" fill="#dc2626" />
      </svg>
    </div>
  );
}

/** Logo resize drag handle — visible at bottom-right of the logo area */
function LogoResizeHandle({ isDraggingRef }: { isDraggingRef: React.MutableRefObject<boolean> }) {
  const updateField = useScheduleStore((s) => s.updateField);
  const dragState = useRef<{ startY: number; startScale: number } | null>(null);

  // Store updateField in a ref so the window listeners always use the latest
  const updateFieldRef = useRef(updateField);
  updateFieldRef.current = updateField;

  // Clean up window listeners on unmount
  const listenersRef = useRef<{ move: (e: MouseEvent) => void; up: (e: MouseEvent) => void } | null>(null);

  useEffect(() => {
    return () => {
      if (listenersRef.current) {
        window.removeEventListener('mousemove', listenersRef.current.move);
        window.removeEventListener('mouseup', listenersRef.current.up);
      }
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const currentScale = useScheduleStore.getState().schedule.logoScale ?? 1;
    isDraggingRef.current = true;
    dragState.current = { startY: e.clientY, startScale: currentScale };

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragState.current) return;
      const deltaY = ev.clientY - dragState.current.startY;
      const newScale = Math.min(3.0, Math.max(0.3, dragState.current.startScale + deltaY * 0.005));
      updateFieldRef.current('logoScale', Math.round(newScale * 100) / 100);
    };

    const onMouseUp = () => {
      dragState.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      listenersRef.current = null;
      // Delay clearing isDragging so the parent onClick (which fires after mouseup) is suppressed
      setTimeout(() => { isDraggingRef.current = false; }, 0);
    };

    // Remove any stale listeners before adding new ones
    if (listenersRef.current) {
      window.removeEventListener('mousemove', listenersRef.current.move);
      window.removeEventListener('mouseup', listenersRef.current.up);
    }
    listenersRef.current = { move: onMouseMove, up: onMouseUp };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [isDraggingRef]);

  return (
    <div
      className="absolute bottom-1 right-1 cursor-nwse-resize opacity-60 hover:opacity-100 transition-opacity"
      data-export-hide
      onMouseDown={handleMouseDown}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        className="text-gray-400 select-none"
      >
        <path
          d="M11 1L1 11M11 5L5 11M11 9L9 11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/** Invisible drag handle between two info grid columns */
function ColumnResizeHandle({
  colIndex,
  columns,
  gridRef,
}: {
  colIndex: number;
  columns: number[];
  gridRef: React.RefObject<HTMLDivElement | null>;
}) {
  const updateField = useScheduleStore((s) => s.updateField);
  const updateFieldRef = useRef(updateField);
  updateFieldRef.current = updateField;
  const listenersRef = useRef<{ move: (e: MouseEvent) => void; up: () => void } | null>(null);
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (listenersRef.current) {
        window.removeEventListener('mousemove', listenersRef.current.move);
        window.removeEventListener('mouseup', listenersRef.current.up);
      }
    };
  }, []);

  const leftOffset = columns.slice(0, colIndex + 1).reduce((a, b) => a + b, 0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const gridWidth = gridRef.current?.offsetWidth ?? 1;
    const startX = e.clientX;
    const startCols = useScheduleStore.getState().schedule.infoGridColumns ?? [15, 25, 18, 16, 26];
    setDragging(true);

    const onMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const deltaPct = (deltaX / gridWidth) * 100;
      const newCols = [...startCols];
      const MIN = 8;
      let left = startCols[colIndex] + deltaPct;
      let right = startCols[colIndex + 1] - deltaPct;
      if (left < MIN) { right -= (MIN - left); left = MIN; }
      if (right < MIN) { left -= (MIN - right); right = MIN; }
      left = Math.max(MIN, left);
      right = Math.max(MIN, right);
      newCols[colIndex] = Math.round(left * 100) / 100;
      newCols[colIndex + 1] = Math.round(right * 100) / 100;
      updateFieldRef.current('infoGridColumns', newCols);
    };

    const onMouseUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      listenersRef.current = null;
    };

    if (listenersRef.current) {
      window.removeEventListener('mousemove', listenersRef.current.move);
      window.removeEventListener('mouseup', listenersRef.current.up);
    }
    listenersRef.current = { move: onMouseMove, up: onMouseUp };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [colIndex, gridRef]);

  return (
    <div
      data-export-hide
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        position: 'absolute',
        left: `${leftOffset}%`,
        top: 0,
        bottom: 0,
        width: 7,
        transform: 'translateX(-50%)',
        cursor: 'col-resize',
        zIndex: 10,
        background: hovering || dragging ? 'rgba(59, 130, 246, 0.5)' : 'transparent',
        transition: 'background 0.15s',
      }}
    />
  );
}

/** Draggable horizontal handle between talent/director and hospital sections */
function HospitalSplitHandle() {
  const updateField = useScheduleStore((s) => s.updateField);
  const updateFieldRef = useRef(updateField);
  updateFieldRef.current = updateField;
  const listenersRef = useRef<{ move: (e: MouseEvent) => void; up: () => void } | null>(null);
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (listenersRef.current) {
        window.removeEventListener('mousemove', listenersRef.current.move);
        window.removeEventListener('mouseup', listenersRef.current.up);
      }
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const container = (e.currentTarget as HTMLElement).parentElement;
    if (!container) return;
    const containerHeight = container.offsetHeight;
    const startY = e.clientY;
    const startPercent = useScheduleStore.getState().schedule.hospitalSplitPercent ?? 70;
    setDragging(true);

    const onMouseMove = (ev: MouseEvent) => {
      const deltaY = ev.clientY - startY;
      const deltaPct = (deltaY / containerHeight) * 100;
      const newPercent = Math.min(85, Math.max(30, startPercent + deltaPct));
      updateFieldRef.current('hospitalSplitPercent', Math.round(newPercent * 100) / 100);
    };

    const onMouseUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      listenersRef.current = null;
    };

    if (listenersRef.current) {
      window.removeEventListener('mousemove', listenersRef.current.move);
      window.removeEventListener('mouseup', listenersRef.current.up);
    }
    listenersRef.current = { move: onMouseMove, up: onMouseUp };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  const splitPercent = useScheduleStore((s) => s.schedule.hospitalSplitPercent ?? 70);

  return (
    <div
      data-export-hide
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${splitPercent}%`,
        height: 7,
        transform: 'translateY(-50%)',
        cursor: 'row-resize',
        zIndex: 10,
        background: hovering || dragging ? 'rgba(59, 130, 246, 0.5)' : 'transparent',
        transition: 'background 0.15s',
      }}
    />
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const raw = reader.result as string;
      const url = await compressImage(raw);
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
