import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Schedule,
  Contact,
  LogoImage,
  CallTime,
  TalentCall,
  BgCall,
  ScheduleRow,
  SceneRow,
  ActionBarRow,
  ActionBarType,
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
    sunrise: '',
    sunset: '',
    weather: '',

    hospitalName: '',
    hospitalDepartment: '',
    hospitalAddress: '',
    hospitalPhone: '',

    logoScale: 1.0,

    productionTime: '',
    generalTime: '',
    artistTime: '',
    setupTimeStart: '',
    setupTimeEnd: '',

    crewCallTime: '',
    rows: [
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

  // Logos
  addLogo: () => void;
  removeLogo: (id: string) => void;
  reorderLogos: (fromIndex: number, toIndex: number) => void;

  // Call times
  addCallTime: () => void;
  removeCallTime: (id: string) => void;
  updateCallTime: (id: string, updates: Partial<Omit<CallTime, 'id'>>) => void;

  // Talent calls
  addTalentCall: () => void;
  removeTalentCall: (id: string) => void;
  updateTalentCall: (id: string, updates: Partial<Omit<TalentCall, 'id'>>) => void;

  // BG calls
  addBgCall: () => void;
  removeBgCall: (id: string) => void;
  updateBgCall: (id: string, updates: Partial<Omit<BgCall, 'id'>>) => void;

  // Rows
  addRow: (row: ScheduleRow) => void;
  removeRow: (id: string) => void;
  updateRow: (id: string, updates: Partial<Omit<SceneRow, 'id' | 'type'>> | Partial<Omit<ActionBarRow, 'id' | 'type'>>) => void;
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
        set((state) => ({
          schedule: {
            ...state.schedule,
            rows: state.schedule.rows.filter((r) => r.id !== id),
          },
        })),
      updateRow: (id, updates) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            rows: state.schedule.rows.map((r) =>
              r.id === id ? { ...r, ...updates } : r
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
    }
  )
);

export { createDefaultSchedule };
