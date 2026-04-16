import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Schedule,
  Contact,
  LogoImage,
  CallTime,
  TalentCall,
  BgCall,
  QuickRefEntry,
  ScheduleRow,
  SceneRow,
  ActionBarRow,
  ActionBarType,
  InfoRow,
} from './types';

function createDefaultSchedule(): Schedule {
  return {
    id: crypto.randomUUID(),
    projectName: '',
    date: '',
    dayNumber: 1,
    totalDays: 1,
    version: 1,
    versionNotes: '',

    themeColor: '#1a1a2e',
    quickRefColor: '',
    wrapColor: '#e2b714',
    taillightsColor: '#cc0000',

    contacts: [
      { id: crypto.randomUUID(), title: 'Executive Producer', name: '', phone: '' },
      { id: crypto.randomUUID(), title: 'Producer', name: '', phone: '' },
      { id: crypto.randomUUID(), title: '1st AD', name: '', phone: '' },
    ],
    logos: [
      { id: crypto.randomUUID(), url: '', name: '' },
    ],
    callTimes: [
      { id: crypto.randomUUID(), label: 'Production', time: '' },
      { id: crypto.randomUUID(), label: 'General Call', time: '' },
      { id: crypto.randomUUID(), label: 'Artist Call', time: '' },
      { id: crypto.randomUUID(), label: 'Shoot Call', time: '' },
      { id: crypto.randomUUID(), label: 'Lunch', time: '' },
      { id: crypto.randomUUID(), label: 'Camera Wrap', time: '' },
    ],
    talentCalls: [
      { id: crypto.randomUUID(), label: '', time: '' },
      { id: crypto.randomUUID(), label: '', time: '' },
    ],
    bgCalls: [],

    director: '',
    shootingLocation: '',
    shootingLat: 0,
    shootingLon: 0,
    sunrise: '',
    sunset: '',
    weather: '',

    hospitalName: '',
    hospitalDepartment: '',
    hospitalAddress: '',
    hospitalPhone: '',

    paperSize: 'letter',
    logoScale: 1.0,
    infoGridColumns: [15, 25, 18, 16, 26],
    hospitalSplitPercent: 60,
    fontFamily: 'Nunito',
    fontSize: 12,
    borderWidth: 2,
    borderColor: '#9ca3af',

    quickRefEntries: [
      { id: crypto.randomUUID(), label: 'Production', time: '' },
      { id: crypto.randomUUID(), label: 'General', time: '' },
      { id: crypto.randomUUID(), label: 'Artist', time: '' },
      { id: crypto.randomUUID(), label: 'Setup', time: '' },
    ],

    pageBreaks: [],
    extraPages: 0,

    rows: [
      {
        id: crypto.randomUUID(),
        type: 'info',
        preSchedule: true,
        timeStart: '',
        timeEnd: '',
        label: 'General Crew Call + Safety Meeting',
      } as InfoRow,
      {
        id: crypto.randomUUID(),
        type: 'info',
        preSchedule: true,
        timeStart: '',
        timeEnd: '',
        label: 'First Shot',
        isFirstShot: true,
      } as InfoRow,
      {
        id: crypto.randomUUID(),
        type: 'scene',
        timeStart: '',
        timeEnd: '',
        description: '',
        boardImages: [],
        boardScale: 1,
        talent: '',
        details: '',
        allowTime: '',
      } as SceneRow,
      {
        id: crypto.randomUUID(),
        type: 'action',
        timeStart: '',
        timeEnd: '',
        label: 'WRAP',
        actionType: 'wrap' as ActionBarType,
        allowTime: '',
      } as ActionBarRow,
      {
        id: crypto.randomUUID(),
        type: 'action',
        timeStart: '',
        timeEnd: '',
        label: 'TAILLIGHTS',
        actionType: 'taillights' as ActionBarType,
        allowTime: '',
      } as ActionBarRow,
    ],
  };
}

interface ScheduleStore {
  schedule: Schedule;

  // Top-level field updates
  updateField: <K extends keyof Schedule>(key: K, value: Schedule[K]) => void;

  // Contacts
  addContact: () => void;
  removeContact: (id: string) => void;
  updateContact: (id: string, updates: Partial<Omit<Contact, 'id'>>) => void;
  reorderContacts: (fromIndex: number, toIndex: number) => void;

  // Logos
  addLogo: () => void;
  removeLogo: (id: string) => void;
  reorderLogos: (fromIndex: number, toIndex: number) => void;

  // Call times
  addCallTime: () => void;
  removeCallTime: (id: string) => void;
  updateCallTime: (id: string, updates: Partial<Omit<CallTime, 'id'>>) => void;
  reorderCallTimes: (fromIndex: number, toIndex: number) => void;

  // Talent calls
  addTalentCall: () => void;
  removeTalentCall: (id: string) => void;
  updateTalentCall: (id: string, updates: Partial<Omit<TalentCall, 'id'>>) => void;
  reorderTalentCalls: (fromIndex: number, toIndex: number) => void;

  // Quick ref entries
  addQuickRefEntry: () => void;
  removeQuickRefEntry: (id: string) => void;
  updateQuickRefEntry: (id: string, updates: Partial<Omit<QuickRefEntry, 'id'>>) => void;

  // BG calls
  addBgCall: () => void;
  removeBgCall: (id: string) => void;
  updateBgCall: (id: string, updates: Partial<Omit<BgCall, 'id'>>) => void;

  // Page breaks
  addPageBreak: (afterRowId: string) => void;
  removePageBreak: (afterRowId: string) => void;
  addExtraPage: () => void;
  removeExtraPage: () => void;

  // Rows
  addRow: (row: ScheduleRow) => void;
  removeRow: (id: string) => void;
  updateRow: (id: string, updates: Partial<Omit<SceneRow, 'id' | 'type'>> | Partial<Omit<ActionBarRow, 'id' | 'type'>> | Partial<Omit<InfoRow, 'id' | 'type'>>) => void;
  reorderRows: (fromIndex: number, toIndex: number) => void;
  insertRowAfter: (afterId: string, row: ScheduleRow) => void;

  // Theme colors
  setThemeColor: (color: string) => void;
  setWrapColor: (color: string) => void;
  setTaillightsColor: (color: string) => void;

  // Reset
  resetSchedule: () => void;
}

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set) => ({
      schedule: createDefaultSchedule(),

      updateField: (key, value) =>
        set((state) => ({
          schedule: { ...state.schedule, [key]: value },
        })),

      // Contacts
      addContact: () =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            contacts: [
              ...state.schedule.contacts,
              { id: crypto.randomUUID(), title: '', name: '', phone: '' },
            ],
          },
        })),
      removeContact: (id) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            contacts: state.schedule.contacts.filter((c) => c.id !== id),
          },
        })),
      updateContact: (id, updates) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            contacts: state.schedule.contacts.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          },
        })),
      reorderContacts: (fromIndex, toIndex) =>
        set((state) => {
          const contacts = [...state.schedule.contacts];
          const [moved] = contacts.splice(fromIndex, 1);
          contacts.splice(toIndex, 0, moved);
          return { schedule: { ...state.schedule, contacts } };
        }),

      // Logos
      addLogo: () =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            logos: [
              ...state.schedule.logos,
              { id: crypto.randomUUID(), url: '', name: '' },
            ],
          },
        })),
      removeLogo: (id) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            logos: state.schedule.logos.filter((l) => l.id !== id),
          },
        })),
      reorderLogos: (fromIndex, toIndex) =>
        set((state) => {
          const logos = [...state.schedule.logos];
          const [moved] = logos.splice(fromIndex, 1);
          logos.splice(toIndex, 0, moved);
          return { schedule: { ...state.schedule, logos } };
        }),

      // Call times
      addCallTime: () =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            callTimes: [
              ...state.schedule.callTimes,
              { id: crypto.randomUUID(), label: '', time: '' },
            ],
          },
        })),
      removeCallTime: (id) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            callTimes: state.schedule.callTimes.filter((ct) => ct.id !== id),
          },
        })),
      updateCallTime: (id, updates) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            callTimes: state.schedule.callTimes.map((ct) =>
              ct.id === id ? { ...ct, ...updates } : ct
            ),
          },
        })),
      reorderCallTimes: (fromIndex, toIndex) =>
        set((state) => {
          const callTimes = [...state.schedule.callTimes];
          const [moved] = callTimes.splice(fromIndex, 1);
          callTimes.splice(toIndex, 0, moved);
          return { schedule: { ...state.schedule, callTimes } };
        }),

      // Talent calls
      addTalentCall: () =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            talentCalls: [
              ...state.schedule.talentCalls,
              { id: crypto.randomUUID(), label: '', time: '' },
            ],
          },
        })),
      removeTalentCall: (id) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            talentCalls: state.schedule.talentCalls.filter((tc) => tc.id !== id),
          },
        })),
      updateTalentCall: (id, updates) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            talentCalls: state.schedule.talentCalls.map((tc) =>
              tc.id === id ? { ...tc, ...updates } : tc
            ),
          },
        })),
      reorderTalentCalls: (fromIndex, toIndex) =>
        set((state) => {
          const talentCalls = [...state.schedule.talentCalls];
          const [moved] = talentCalls.splice(fromIndex, 1);
          talentCalls.splice(toIndex, 0, moved);
          return { schedule: { ...state.schedule, talentCalls } };
        }),

      // Quick ref entries
      addQuickRefEntry: () =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            quickRefEntries: [
              ...state.schedule.quickRefEntries,
              { id: crypto.randomUUID(), label: '', time: '' },
            ],
          },
        })),
      removeQuickRefEntry: (id) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            quickRefEntries: state.schedule.quickRefEntries.filter((e) => e.id !== id),
          },
        })),
      updateQuickRefEntry: (id, updates) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            quickRefEntries: state.schedule.quickRefEntries.map((e) =>
              e.id === id ? { ...e, ...updates } : e
            ),
          },
        })),

      // BG calls
      addBgCall: () =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            bgCalls: [
              ...state.schedule.bgCalls,
              { id: crypto.randomUUID(), label: '', time: '' },
            ],
          },
        })),
      removeBgCall: (id) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            bgCalls: state.schedule.bgCalls.filter((bc) => bc.id !== id),
          },
        })),
      updateBgCall: (id, updates) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            bgCalls: state.schedule.bgCalls.map((bc) =>
              bc.id === id ? { ...bc, ...updates } : bc
            ),
          },
        })),

      // Page breaks
      addPageBreak: (afterRowId) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            pageBreaks: state.schedule.pageBreaks.includes(afterRowId)
              ? state.schedule.pageBreaks
              : [...state.schedule.pageBreaks, afterRowId],
          },
        })),
      removePageBreak: (afterRowId) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            pageBreaks: state.schedule.pageBreaks.filter((id) => id !== afterRowId),
          },
        })),
      addExtraPage: () =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            extraPages: (state.schedule.extraPages || 0) + 1,
          },
        })),
      removeExtraPage: () =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            extraPages: Math.max(0, (state.schedule.extraPages || 0) - 1),
          },
        })),

      // Rows
      addRow: (row) =>
        set((state) => {
          const rows = [...state.schedule.rows];
          const firstTerminal = rows.findIndex(
            (r) =>
              r.type === 'action' &&
              ((r as ActionBarRow).actionType === 'wrap' ||
                (r as ActionBarRow).actionType === 'taillights')
          );
          if (firstTerminal !== -1) {
            rows.splice(firstTerminal, 0, row);
          } else {
            rows.push(row);
          }
          return { schedule: { ...state.schedule, rows } };
        }),
      removeRow: (id) =>
        set((state) => {
          const row = state.schedule.rows.find((r) => r.id === id);
          // Prevent deleting the First Shot row
          if (row && row.type === 'info' && (row as InfoRow).isFirstShot) return state;
          return {
            schedule: {
              ...state.schedule,
              rows: state.schedule.rows.filter((r) => r.id !== id),
            },
          };
        }),
      updateRow: (id, updates) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            rows: state.schedule.rows.map((r) =>
              r.id === id ? ({ ...r, ...updates } as ScheduleRow) : r
            ),
          },
        })),
      reorderRows: (fromIndex, toIndex) =>
        set((state) => {
          const rows = [...state.schedule.rows];
          const [moved] = rows.splice(fromIndex, 1);
          rows.splice(toIndex, 0, moved);
          return { schedule: { ...state.schedule, rows } };
        }),
      insertRowAfter: (afterId, row) =>
        set((state) => {
          const rows = [...state.schedule.rows];
          const index = rows.findIndex((r) => r.id === afterId);
          if (index === -1) {
            rows.push(row);
          } else {
            rows.splice(index + 1, 0, row);
          }
          return { schedule: { ...state.schedule, rows } };
        }),

      // Theme colors
      setThemeColor: (color) =>
        set((state) => ({
          schedule: { ...state.schedule, themeColor: color },
        })),
      setWrapColor: (color) =>
        set((state) => ({
          schedule: { ...state.schedule, wrapColor: color },
        })),
      setTaillightsColor: (color) =>
        set((state) => ({
          schedule: { ...state.schedule, taillightsColor: color },
        })),

      // Reset
      resetSchedule: () =>
        set({ schedule: createDefaultSchedule() }),
    }),
    {
      name: 'quinnlan-schedule',
      merge: (persistedState: unknown, currentState: ScheduleStore): ScheduleStore => {
        if (!persistedState) return currentState;
        const persisted = persistedState as ScheduleStore;
        const persistedAny = persisted.schedule as unknown as Record<string, unknown>;

        // Migrate old firstShotTime/firstShotLabel into an InfoRow
        let rows = persisted.schedule?.rows || currentState.schedule.rows;
        const hasFirstShotRow = rows.some((r) => r.type === 'info' && (r as InfoRow).isFirstShot);
        if (!hasFirstShotRow) {
          const firstShotRow: InfoRow = {
            id: crypto.randomUUID(),
            type: 'info',
            preSchedule: true,
            timeStart: (persistedAny?.firstShotTime as string) || '',
            timeEnd: '',
            label: (persistedAny?.firstShotLabel as string) || 'First Shot',
            isFirstShot: true,
          };
          rows = [firstShotRow, ...rows];
        }

        // Migrate old crewCallTime/crewCallLabel into an InfoRow
        const hasCrewCallRow = rows.some(
          (r) => r.type === 'info' && !((r as InfoRow).isFirstShot) && (r as InfoRow).preSchedule && (r as InfoRow).label?.includes('Crew Call')
        );
        if (!hasCrewCallRow) {
          const crewCallRow: InfoRow = {
            id: crypto.randomUUID(),
            type: 'info',
            preSchedule: true,
            timeStart: (persistedAny?.crewCallTime as string) || '',
            timeEnd: '',
            label: (persistedAny?.crewCallLabel as string) || 'General Crew Call + Safety Meeting',
          };
          // Insert before the First Shot row
          const firstShotIdx = rows.findIndex((r) => r.type === 'info' && (r as InfoRow).isFirstShot);
          if (firstShotIdx !== -1) {
            rows = [...rows.slice(0, firstShotIdx), crewCallRow, ...rows.slice(firstShotIdx)];
          } else {
            rows = [crewCallRow, ...rows];
          }
        }

        const schedule = {
          ...currentState.schedule,
          ...persisted.schedule,
          rows,
          quickRefEntries: persisted.schedule?.quickRefEntries || currentState.schedule.quickRefEntries,
          fontFamily: persisted.schedule?.fontFamily || currentState.schedule.fontFamily,
          logoScale: persisted.schedule?.logoScale ?? currentState.schedule.logoScale,
          hospitalDepartment: persisted.schedule?.hospitalDepartment ?? currentState.schedule.hospitalDepartment,
          quickRefColor: persisted.schedule?.quickRefColor ?? currentState.schedule.quickRefColor,
          shootingLocation: persisted.schedule?.shootingLocation ?? currentState.schedule.shootingLocation,
          shootingLat: persisted.schedule?.shootingLat ?? currentState.schedule.shootingLat,
          shootingLon: persisted.schedule?.shootingLon ?? currentState.schedule.shootingLon,
          infoGridColumns: persisted.schedule?.infoGridColumns || currentState.schedule.infoGridColumns,
          fontSize: persisted.schedule?.fontSize ?? currentState.schedule.fontSize,
          borderWidth: persisted.schedule?.borderWidth ?? currentState.schedule.borderWidth,
          borderColor: persisted.schedule?.borderColor ?? currentState.schedule.borderColor,
          paperSize: persisted.schedule?.paperSize ?? currentState.schedule.paperSize,
          hospitalSplitPercent: persisted.schedule?.hospitalSplitPercent ?? 60,
          pageBreaks: persisted.schedule?.pageBreaks ?? [],
          extraPages: persisted.schedule?.extraPages ?? 0,
        };

        // Remove old fields that are no longer on the Schedule type
        delete (schedule as unknown as Record<string, unknown>).firstShotTime;
        delete (schedule as unknown as Record<string, unknown>).firstShotLabel;
        delete (schedule as unknown as Record<string, unknown>).crewCallTime;
        delete (schedule as unknown as Record<string, unknown>).crewCallLabel;

        return {
          ...currentState,
          ...persisted,
          schedule,
        };
      },
    }
  )
);

export { createDefaultSchedule };
