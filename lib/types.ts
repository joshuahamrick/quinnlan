export interface Schedule {
  id: string;
  projectName: string;
  date: string;
  dayNumber: number;
  totalDays: number;
  version: number;
  versionNotes: string;

  // Theme colors
  themeColor: string;
  wrapColor: string;
  taillightsColor: string;

  // Info grid
  contacts: Contact[];
  logos: LogoImage[];
  callTimes: CallTime[];
  talentCalls: TalentCall[];
  bgCalls: BgCall[];

  // Director & production info
  director: string;
  sunrise: string;
  sunset: string;
  weather: string;

  // Hospital
  hospitalName: string;
  hospitalDepartment: string;
  hospitalAddress: string;
  hospitalPhone: string;

  // Logo display
  logoScale: number;

  // Quick reference times
  productionTime: string;
  generalTime: string;
  artistTime: string;
  setupTimeStart: string;
  setupTimeEnd: string;

  // Schedule body
  crewCallTime: string;
  rows: ScheduleRow[];
}

export interface Contact {
  id: string;
  title: string;
  name: string;
  phone: string;
}

export interface LogoImage {
  id: string;
  url: string;
  name: string;
}

export interface CallTime {
  id: string;
  label: string;
  time: string;
}

export interface TalentCall {
  id: string;
  label: string;
  time: string;
}

export interface BgCall {
  id: string;
  label: string;
  time: string;
}

export type ScheduleRow = SceneRow | ActionBarRow;

export interface SceneRow {
  id: string;
  type: 'scene';
  timeStart: string;
  timeEnd: string;
  description: string;
  boardImages: string[];
  talent: string;
  details: string;
  allowTime: string;
}

export type ActionBarType = 'move' | 'lunch' | 'reset' | 'wrap' | 'taillights' | 'custom';

export interface ActionBarRow {
  id: string;
  type: 'action';
  timeStart: string;
  timeEnd: string;
  label: string;
  actionType: ActionBarType;
  color?: string;
  allowTime: string;
}
