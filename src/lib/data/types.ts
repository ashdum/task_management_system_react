// ... existing imports

export interface DataSource {
  // ... existing methods

  // Dashboard invitation methods
  inviteToDashboard(dashboardId: string, email: string): Promise<ApiResponse<DashboardInvitation>>;
  acceptInvitation(invitationId: string): Promise<ApiResponse<void>>;
  rejectInvitation(invitationId: string): Promise<ApiResponse<void>>;
}