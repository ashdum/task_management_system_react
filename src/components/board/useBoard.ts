// src\components\board\useBoard.ts
import { create } from 'zustand';
import { dataSource } from '../../services/data/dataSource'; // use dataSource facade
import { Column, Card, Dashboard } from '../../services/data/interface/dataTypes';
import authService from '../../services/auth/authService';

export interface BoardState {
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  columns: Column[];
  loading: boolean;
  error: string | null;
  loadDashboards: () => Promise<void>;
  addDashboard: (dashboard: Dashboard) => Promise<void>;
  setCurrentDashboard: (dashboardId: string) => Promise<void>;
  updateDashboard: (dashboardId: string, updates: Partial<Dashboard>) => Promise<void>;
  addColumn: (title: string) => Promise<void>;
  deleteColumn: (columnId: string) => void;
  archiveColumn: (columnId: string) => void;
  updateColumn: (column: Column) => void;
  addCard: (columnId: string, title: string) => Promise<void>;
  updateCard: (columnId: string, cardId: string, updatedCard: Partial<Card>) => Promise<void>;
  moveCard: (fromColumnId: string, toColumnId: string, fromIndex: number, toIndex: number) => Promise<void>;
  updateColumnOrder: (dashboardId: string, columnIds: string[]) => Promise<void>;
  inviteToDashboard: (dashboardId: string, email: string) => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  rejectInvitation: (invitationId: string) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  dashboards: [],
  currentDashboard: null,
  columns: [],
  loading: false,
  error: null,

  loadDashboards: async () => {
    console.log('loadDashboards called at', new Date().toISOString());
    try {
      set({ loading: true, error: null });
      const response = await dataSource.getDashboards();
      console.log('loadDashboards response received at', new Date().toISOString());
      if (response.error) throw new Error(response.error.message);
      set({ dashboards: response.data ?? [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addDashboard: async (dashboard: Dashboard) => {
    try {
      set({ loading: true, error: null });
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      // Убедимся, что dashboard содержит корректные данные
      const response = await dataSource.createDashboard(dashboard.title, dashboard.ownerIds[0]);
      if (response.error) throw new Error(response.error.message);
      set(state => ({
        dashboards: [...state.dashboards, response.data!],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  setCurrentDashboard: async (dashboardId: string) => {
    console.log('setCurrentDashboard called with', dashboardId, 'at', new Date().toISOString());
    try {
      set({ loading: true, error: null });
      const response = await dataSource.getDashboards();
      console.log('setCurrentDashboard response received at', new Date().toISOString());
      if (response.error) throw new Error(response.error.message);
      const dashboards = response.data ?? [];
      const currentDashboard = dashboards.find(d => d.id === dashboardId);
      if (!currentDashboard) {
        throw new Error('Dashboard not found');
      }
      set({
        currentDashboard,
        columns: currentDashboard.columns,
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateDashboard: async (dashboardId: string, updates: Partial<Dashboard>) => {
    try {
      set({ loading: true, error: null });
      const response = await dataSource.updateDashboard(dashboardId, updates);
      if (response.error) throw new Error(response.error.message);
      set(state => ({
        currentDashboard: response.data,
        dashboards: state.dashboards.map(d =>
          d.id === dashboardId ? response.data! : d
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addColumn: async (title: string) => {
    const { currentDashboard } = get();
    if (!currentDashboard) return;
    try {
      set({ loading: true, error: null });
      const response = await dataSource.createColumn(currentDashboard.id, title);
      if (response.error) throw new Error(response.error.message);
      set(state => ({
        columns: [...state.columns, response.data!],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteColumn: (columnId: string) => {
    set(state => ({
      columns: state.columns.filter(column => column.id !== columnId),
    }));
  },

  archiveColumn: (columnId: string) => {
    set(state => ({
      columns: state.columns.filter(column => column.id !== columnId),
    }));
  },

  updateColumn: (column: Column) => {
    set(state => ({
      columns: state.columns.map(c => (c.id === column.id ? column : c)),
    }));
  },

  addCard: async (columnId: string, title: string) => {
    const { currentDashboard } = get();
    if (!currentDashboard) return;
    try {
      set({ loading: true, error: null });
      const response = await dataSource.createCard(currentDashboard.id, columnId, title);
      if (response.error) throw new Error(response.error.message);
      set(state => ({
        columns: state.columns.map(column =>
          column.id === columnId
            ? { ...column, cards: [...column.cards, response.data!] }
            : column
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateCard: async (columnId: string, cardId: string, updatedCard: Partial<Card>) => {
    const { currentDashboard } = get();
    if (!currentDashboard) return;
    try {
      set({ loading: true, error: null });
      const response = await dataSource.updateCard(currentDashboard.id, columnId, cardId, updatedCard);
      if (response.error) throw new Error(response.error.message);
      set(state => ({
        columns: state.columns.map(column =>
          column.id === columnId
            ? {
                ...column,
                cards: column.cards.map(c => (c.id === cardId ? response.data! : c)),
              }
            : column
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  moveCard: async (fromColumnId: string, toColumnId: string, fromIndex: number, toIndex: number) => {
    const { currentDashboard, columns } = get();
    if (!currentDashboard) return;
    const sourceColumn = columns.find(col => col.id === fromColumnId);
    if (!sourceColumn) return;
    const card = sourceColumn.cards[fromIndex];
    if (!card) return;
    // Update state immediately for smooth UI
    set(state => {
      const newColumns = state.columns.map(col => ({ ...col, cards: [...col.cards] }));
      const fromColumn = newColumns.find(col => col.id === fromColumnId);
      const toColumn = newColumns.find(col => col.id === toColumnId);
      if (!fromColumn || !toColumn) return state;
      const [movedCard] = fromColumn.cards.splice(fromIndex, 1);
      toColumn.cards.splice(toIndex, 0, movedCard);
      return { columns: newColumns };
    });
    try {
      const response = await dataSource.moveCard(currentDashboard.id, fromColumnId, toColumnId, card.id, toIndex);
      if (response.error) throw new Error(response.error.message);
    } catch (error) {
      // Revert state if API call fails
      set({ columns, error: (error as Error).message });
    }
  },

  updateColumnOrder: async (dashboardId: string, columnIds: string[]) => {
    const { columns: originalColumns } = get();
    // Update state immediately for smooth UI
    set(state => {
      const newColumns = columnIds.map((columnId, index) => {
        const column = state.columns.find(c => c.id === columnId);
        if (!column) throw new Error('Column not found');
        return { ...column, order: index + 1 };
      });
      return { columns: newColumns };
    });
    try {
      const response = await dataSource.updateColumnOrder(dashboardId, columnIds);
      if (response.error) throw new Error(response.error.message);
    } catch (error) {
      // Revert state on error
      set({ columns: originalColumns, error: (error as Error).message });
    }
  },

  inviteToDashboard: async (dashboardId: string, email: string) => {
    try {
      set({ loading: true, error: null });
      const response = await dataSource.inviteToDashboard(dashboardId, email);
      if (response.error) throw new Error(response.error.message);
      set(state => ({
        currentDashboard: state.currentDashboard
          ? {
              ...state.currentDashboard,
              invitations: [...(state.currentDashboard.invitations || []), response.data!],
            }
          : null,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  acceptInvitation: async (invitationId: string) => {
    try {
      set({ loading: true, error: null });
      const response = await dataSource.acceptInvitation(invitationId);
      if (response.error) throw new Error(response.error.message);
      // Refresh dashboards list after accepting invitation
      const dashboardsResponse = await dataSource.getDashboards();
      if (dashboardsResponse.error) throw new Error(dashboardsResponse.error.message);
      set({
        dashboards: dashboardsResponse.data!,
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  rejectInvitation: async (invitationId: string) => {
    try {
      set({ loading: true, error: null });
      const response = await dataSource.rejectInvitation(invitationId);
      if (response.error) throw new Error(response.error.message);
      set(state => ({
        currentDashboard: state.currentDashboard
          ? {
              ...state.currentDashboard,
              invitations: state.currentDashboard.invitations?.filter(
                inv => inv.id !== invitationId
              ),
            }
          : null,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
}));