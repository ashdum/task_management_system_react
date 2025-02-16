import { dataSource } from '../data';
import type { User, Dashboard, Card, Column } from '../../types';

export class API {
  // Auth methods
  static async login(email: string, password: string): Promise<User> {
    const response = await dataSource.login(email, password);
    if (response.error) throw response.error;
    return response.data!;
  }

  static async register(email: string, password: string): Promise<User> {
    const response = await dataSource.register(email, password);
    if (response.error) throw response.error;
    return response.data!;
  }

  static async logout(): Promise<void> {
    await dataSource.logout();
  }

  // Dashboard methods
  static async getDashboards(): Promise<Dashboard[]> {
    const response = await dataSource.getDashboards();
    if (response.error) throw response.error;
    return response.data!;
  }

  static async createDashboard(title: string, userId: string): Promise<Dashboard> {
    const response = await dataSource.createDashboard(title, userId);
    if (response.error) throw response.error;
    return response.data!;
  }

  static async updateDashboard(id: string, updates: Partial<Dashboard>): Promise<Dashboard> {
    const response = await dataSource.updateDashboard(id, updates);
    if (response.error) throw response.error;
    return response.data!;
  }

  // Column methods
  static async createColumn(dashboardId: string, title: string): Promise<Column> {
    const response = await dataSource.createColumn(dashboardId, title);
    if (response.error) throw response.error;
    return response.data!;
  }

  static async updateColumnOrder(dashboardId: string, columnIds: string[]): Promise<void> {
    const response = await dataSource.updateColumnOrder(dashboardId, columnIds);
    if (response.error) throw response.error;
  }

  // Card methods
  static async createCard(dashboardId: string, columnId: string, title: string): Promise<Card> {
    const response = await dataSource.createCard(dashboardId, columnId, title);
    if (response.error) throw response.error;
    return response.data!;
  }

  static async updateCard(
    dashboardId: string,
    columnId: string,
    cardId: string,
    updates: Partial<Card>
  ): Promise<Card> {
    const response = await dataSource.updateCard(dashboardId, columnId, cardId, updates);
    if (response.error) throw response.error;
    return response.data!;
  }

  static async moveCard(
    dashboardId: string,
    fromColumnId: string,
    toColumnId: string,
    cardId: string,
    newIndex: number
  ): Promise<void> {
    const response = await dataSource.moveCard(
      dashboardId,
      fromColumnId,
      toColumnId,
      cardId,
      newIndex
    );
    if (response.error) throw response.error;
  }

  // Dashboard invitation methods
  static async inviteToDashboard(dashboardId: string, email: string) {
    const response = await dataSource.inviteToDashboard(dashboardId, email);
    if (response.error) throw response.error;
    return response;
  }

  static async acceptInvitation(invitationId: string) {
    const response = await dataSource.acceptInvitation(invitationId);
    if (response.error) throw response.error;
    return response;
  }

  static async rejectInvitation(invitationId: string) {
    const response = await dataSource.rejectInvitation(invitationId);
    if (response.error) throw response.error;
    return response;
  }
}