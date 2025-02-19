// src/services/data/types.ts
// DataSource interface for different implementations

import { 
    ApiResponse, 
    AuthResponse, 
    Dashboard, 
    DashboardInvitation, 
    Card, 
    Column 
  } from '../../types';
  
  export interface DataSource {
    // Auth
    login(email: string, password: string): Promise<ApiResponse<AuthResponse>>;
    register(email: string, password: string, fullName: string): Promise<ApiResponse<AuthResponse>>;
    logout(): Promise<ApiResponse<any>>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<ApiResponse<any>>;
  
    // Dashboards
    getDashboards(): Promise<ApiResponse<Dashboard[]>>;
    getDashboard(id: string): Promise<ApiResponse<Dashboard>>;
    createDashboard(title: string, userId: string): Promise<ApiResponse<Dashboard>>;
    updateDashboard(id: string, data: Partial<Dashboard>): Promise<ApiResponse<Dashboard>>;
    deleteDashboard(id: string): Promise<ApiResponse<void>>;
  
    // Invitations
    inviteToDashboard(dashboardId: string, email: string): Promise<ApiResponse<DashboardInvitation>>;
    acceptInvitation(invitationId: string): Promise<ApiResponse<void>>;
    rejectInvitation(invitationId: string): Promise<ApiResponse<void>>;
  
    // Columns
    createColumn(dashboardId: string, title: string): Promise<ApiResponse<Column>>;
    updateColumn(dashboardId: string, columnId: string, data: Partial<Column>): Promise<ApiResponse<Column>>;
    deleteColumn(dashboardId: string, columnId: string): Promise<ApiResponse<void>>;
    updateColumnOrder(dashboardId: string, columnIds: string[]): Promise<ApiResponse<void>>;
  
    // Cards
    createCard(dashboardId: string, columnId: string, title: string): Promise<ApiResponse<Card>>;
    updateCard(dashboardId: string, columnId: string, cardId: string, data: Partial<Card>): Promise<ApiResponse<Card>>;
    deleteCard(dashboardId: string, columnId: string, cardId: string): Promise<ApiResponse<void>>;
    moveCard(
      dashboardId: string, 
      fromColumnId: string, 
      toColumnId: string, 
      cardId: string, 
      newIndex: number
    ): Promise<ApiResponse<void>>;

  }
  