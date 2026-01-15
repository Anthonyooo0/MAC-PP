
export interface Milestones {
  design: boolean;
  mat: boolean;
  fab: boolean;
  fat: boolean;
  ship: boolean;
}

export type ProjectStatus = 'Active' | 'Critical' | 'Late' | 'Done';
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

export type ViewMode = 'dashboard' | 'list' | 'calendar' | 'changelog';
