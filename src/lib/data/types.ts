// ... existing imports

import { ApiResponse, User, AuthResponse, DashboardInvitation, Dashboard } from "../../types";

export interface DataSource {
  // Auth methods
  login(email: string, password: string): Promise<ApiResponse<AuthResponse>>;
  register(email: string, password: string): Promise<ApiResponse<AuthResponse>>;
  logout(): Promise<void>;

  // Dashboard methods
  getDashboards(): Promise<ApiResponse<Dashboard[]>>;
  getDashboard(id: string): Promise<ApiResponse<Dashboard>>;
  createDashboard(title: string, userId: string): Promise<ApiResponse<Dashboard>>;
  updateDashboard(id: string, data: Partial<Dashboard>): Promise<ApiResponse<Dashboard>>;
  deleteDashboard(id: string): Promise<ApiResponse<void>>;

  // Dashboard invitation methods
  inviteToDashboard(dashboardId: string, email: string): Promise<ApiResponse<DashboardInvitation>>;
  acceptInvitation(invitationId: string): Promise<ApiResponse<void>>;
  rejectInvitation(invitationId: string): Promise<ApiResponse<void>>;
}