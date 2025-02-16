// User related types
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
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