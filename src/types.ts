// Auth related types
export interface AuthResponse extends User {
  token: string;
  refreshToken?: string;
}

// User related types
export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DashboardInvitation {
  id: string;
  dashboardId: string;
  inviterId: string;
  inviterEmail: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Dashboard {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  ownerIds: string[];
  members: User[];
  columns: Column[];
  background?: string;
  description?: string;
  isPublic?: boolean;
  settings?: DashboardSettings;
  invitations?: DashboardInvitation[];
}

export interface Column {
  id: string;
  title: string;
  order: number;
  cards: Card[];
  is_archive?: boolean;
}

export interface Card {
  id: string;
  number: number;
  title: string;
  description?: string;
  columnId: string;
  members: CardMember[];
  labels: Label[];
  checklists: Checklist[];
  comments: Comment[];
  images?: string[];
  attachments?: Attachment[];
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CardMember {
  id: string;
  email: string;
}

export interface Label {
  id: string;
  text: string;
  color: string;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userEmail: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export interface DashboardSettings {
  isPublic: boolean;
  allowComments: boolean;
  allowInvites: boolean;
  theme?: string;
}

export interface DashboardStats {
  totalCards: number;
  completedCards: number;
  totalMembers: number;
  totalComments: number;
  totalAttachments: number;
  totalChecklists: number;
  completedChecklists: number;
  cardsByLabel: { [key: string]: number };
  cardsByMember: { [key: string]: number };
  cardsByColumn: { [key: string]: number };
  activityByDay: { [key: string]: number };
  completionRate: number;
}

export interface StatFilter {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  members: string[];
  labels: string[];
  columns: string[];
}

// API related types
export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status?: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}