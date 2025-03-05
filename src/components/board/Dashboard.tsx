// src/components/board/Dashboard.tsx
import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Plus, ArrowLeft, Search, BarChart3 } from 'lucide-react';
import { useBoardStore } from './useBoard';
import Column from './Column';
import DashboardList from './DashboardList';
import Footer from '../layout/Footer';
import Header from '../layout/Header';
import { User } from '../../services/data/interface/dataTypes';
import NewColumnModal from '../modals/NewColumnModal';
import DashboardSettings from './DashboardSettings';
import DashboardStats from '../statistics/DashboardStats';
import { useParams, useNavigate } from 'react-router-dom';

interface DashboardProps {
  user: User;
  onSignOut: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  const [showDashboardList, setShowDashboardList] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const {
    columns,
    moveCard,
    addColumn,
    currentDashboard,
    setCurrentDashboard,
    updateColumnOrder,
    updateDashboard,
  } = useBoardStore();
  const [isNewColumnModalOpen, setIsNewColumnModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredColumns, setFilteredColumns] = useState(columns || []);

  const { dashboardId } = useParams<{ dashboardId?: string }>();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (dashboardId) {
      setCurrentDashboard(dashboardId); // Загружаем дашборд по ID
      setShowDashboardList(false); // Скрываем список
    } else {
      setShowDashboardList(true); // Показываем список, если нет ID
    }
  }, [dashboardId, setCurrentDashboard]);

  const canEditDashboard = currentDashboard?.ownerIds.includes(user.id) || false;

  React.useEffect(() => {
    if (!columns) return;

    if (searchQuery.trim() === '') {
      setFilteredColumns(columns.filter(column => !column.is_archive));
      return;
    }

    const searchLower = searchQuery.toLowerCase();
    const filtered = columns
      .filter(column => !column.is_archive)
      .map(column => ({
        ...column,
        cards: column.cards.filter(card => {
          const cardNumberStr = String(card.number);
          return (
            cardNumberStr.includes(searchLower) ||
            card.title.toLowerCase().includes(searchLower) ||
            card.description?.toLowerCase().includes(searchLower)
          );
        })
      }));

    setFilteredColumns(filtered);
  }, [searchQuery, columns]);

  const handleDashboardSelect = (dashboardId: string) => {
    setCurrentDashboard(dashboardId);
    setShowDashboardList(false);
    navigate(`/dashboard/${dashboardId}`); // Переходим на новый URL
  };

  const handleAddColumn = (title: string) => {
    addColumn(title);
    setIsNewColumnModalOpen(false);
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination || !currentDashboard) {
      return;
    }

    if (type === 'column') {
      if (source.index === destination.index) {
        return;
      }

      const newColumns = Array.from(columns || []);
      const [removed] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, removed);

      const columnIds = newColumns.map(col => col.id);
      await updateColumnOrder(currentDashboard.id, columnIds);
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    moveCard(
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );
  };

  const handleUpdateBackground = (background: string) => {
    if (!currentDashboard) return;
    updateDashboard(currentDashboard.id, { background });
  };

  const sortedColumns = [...(filteredColumns || [])].sort((a, b) =>
    (a.order || 0) - (b.order || 0)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} onSignOut={onSignOut} />

      {showDashboardList ? (
        <div className="flex-grow bg-gray-50">
          <div className="w-4/5 mx-auto">
            <DashboardList onDashboardSelect={handleDashboardSelect} />
          </div>
        </div>
      ) : (
        <div
          className="flex-grow p-4 transition-all duration-300 bg-cover bg-center"
          style={{
            backgroundImage: currentDashboard?.background
              ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${currentDashboard.background})`
              : 'linear-gradient(to bottom right, #3B82F6, #8B5CF6)'
          }}
        >
          <div className="w-4/5 mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowDashboardList(true)}
                  className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-white">
                  {currentDashboard?.title || 'Task Management System'}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="pl-9 pr-4 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowStats(true)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="View Statistics"
                >
                  <BarChart3 size={20} />
                </button>
                {currentDashboard && canEditDashboard && (
                  <DashboardSettings
                    dashboard={currentDashboard}
                    onUpdateBackground={handleUpdateBackground}
                    user={user} // Передаем user как есть
                  />
                )}
                {canEditDashboard && (
                  <button
                    onClick={() => setIsNewColumnModalOpen(true)}
                    className="bg-white text-blue-500 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1 text-sm"
                  >
                    <Plus size={16} />
                    Add Column
                  </button>
                )}
              </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="board" direction="horizontal" type="column">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex gap-4 overflow-x-auto flex-grow pb-4 items-start h-[calc(100vh-12rem)]"
                  >
                    {sortedColumns.map((column, index) => (
                      <Column
                        key={column.id}
                        column={column}
                        index={index}
                        searchQuery={searchQuery}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      )}
      <Footer />

      <NewColumnModal
        isOpen={isNewColumnModalOpen}
        onClose={() => setIsNewColumnModalOpen(false)}
        onAdd={handleAddColumn}
      />

      {showStats && currentDashboard && (
        <DashboardStats
          dashboard={currentDashboard}
          isOpen={true}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;