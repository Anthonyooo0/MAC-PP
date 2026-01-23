
export type MilestoneStatus = 'not_started' | 'started' | 'stuck' | 'completed';

export interface Milestones {
  design: MilestoneStatus | boolean;
  mat: MilestoneStatus | boolean;
  fab: MilestoneStatus | boolean;
  fat: MilestoneStatus | boolean;
  ship: MilestoneStatus | boolean;
}

export interface PunchListAttachment {
  id: string;
  url: string;
  type: 'image' | 'video';
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface PunchListItem {
  id: string;
  description: string;
  completed: boolean;
  attachments?: PunchListAttachment[];
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
