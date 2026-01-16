
export interface Milestones {
  design: boolean;
  mat: boolean;
  fab: boolean;
  fat: boolean;
  ship: boolean;
}

export interface PunchListItem {
  id: string;
  description: string;
  completed: boolean;
}

export type ProjectStatus = 'Active' | 'Critical' | 'Late' | 'FAT' | 'Done';
export type ProjectCategory = 'Pumping' | 'Field Service' | 'EHV';

export interface Project {
  id: number;
  category: ProjectCategory;
  utility: string;
  substation: string;
  dateCreated: string;
  order: string;
  fatDate: string;
  landing: string;
  status: ProjectStatus;
  progress: number;
  lead: string;
  description: string;
  comments: string;
  milestones: Milestones;
  punchList?: PunchListItem[];
}

export interface ChangeLogEntry {
  id: string;
  timestamp: string;
  userEmail: string;
  projectId: number;
  projectInfo: string;
  action: string;
  changes: string;
}

export type ViewMode = 'dashboard' | 'list' | 'calendar' | 'punchlist' | 'changelog';
