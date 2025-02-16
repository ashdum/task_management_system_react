import { create } from 'zustand';
import { API } from './lib/api';
import { Column, Card, Dashboard } from './types';
import { getCurrentUser } from './lib/auth';

interface BoardState {
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  columns: Column[];
  loading: boolean;
  error: string | null;
  loadDashboards: () => Promise<void>;
  addDashboard: (title: string) => Promise<void>;
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
    try {
      set({ loading: true, error: null });
      const dashboards = await API.getDashboards();
      set({ dashboards, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addDashboard: async (title: string) => {
    try {
      set({ loading: true, error: null });
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      const dashboard = await API.createDashboard(title, currentUser.id);
      set(state => ({
        dashboards: [...state.dashboards, dashboard],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  setCurrentDashboard: async (dashboardId: string) => {
    try {
      set({ loading: true, error: null });
      const dashboards = await API.getDashboards();
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
      const updatedDashboard = await API.updateDashboard(dashboardId, updates);
      set(state => ({
        currentDashboard: updatedDashboard,
        dashboards: state.dashboards.map(d =>
          d.id === dashboardId ? updatedDashboard : d
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
      const column = await API.createColumn(currentDashboard.id, title);
      set(state => ({
        columns: [...state.columns, column],
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
      columns: state.columns.map(c => c.id === column.id ? column : c),
    }));
  },

  addCard: async (columnId: string, title: string) => {
    const { currentDashboard } = get();
    if (!currentDashboard) return;

    try {
      set({ loading: true, error: null });
      const card = await API.createCard(currentDashboard.id, columnId, title);
      set(state => ({
        columns: state.columns.map(column =>
          column.id === columnId
            ? { ...column, cards: [...column.cards, card] }
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
      const card = await API.updateCard(currentDashboard.id, columnId, cardId, updatedCard);
      set(state => ({
        columns: state.columns.map(column =>
          column.id === columnId
            ? {
                ...column,
                cards: column.cards.map(c => (c.id === cardId ? card : c)),
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
      await API.moveCard(currentDashboard.id, fromColumnId, toColumnId, card.id, toIndex);
    } catch (error) {
      // Revert the state if the API call fails
      set(state => ({ columns, error: (error as Error).message }));
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
      await API.updateColumnOrder(dashboardId, columnIds);
    } catch (error) {
      // Revert the state if the API call fails
      set({ columns: originalColumns, error: (error as Error).message });
    }
  },

  inviteToDashboard: async (dashboardId: string, email: string) => {
    try {
      set({ loading: true, error: null });
      const response = await API.inviteToDashboard(dashboardId, email);
      if (response.error) throw response.error;

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
      const response = await API.acceptInvitation(invitationId);
      if (response.error) throw response.error;

      // Refresh dashboards list to include the newly accepted dashboard
      const dashboardsResponse = await API.getDashboards();
      if (dashboardsResponse.error) throw dashboardsResponse.error;

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
      const response = await API.rejectInvitation(invitationId);
      if (response.error) throw response.error;

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