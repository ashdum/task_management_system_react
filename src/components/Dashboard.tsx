import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Plus, ArrowLeft, Search } from 'lucide-react';
import { useBoardStore } from '../store';
import Column from './Column';
import DashboardList from './DashboardList';
import Footer from './Footer';
import Header from './Header';
import { User } from '../types';
import NewColumnModal from './NewColumnModal';
import DashboardSettings from './DashboardSettings';

interface DashboardProps {
  user: User;
  onSignOut: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  const [showDashboardList, setShowDashboardList] = useState(true);
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

  const canEditDashboard = currentDashboard?.ownerIds.includes(user.id) || false;

  React.useEffect(() => {
    if (!columns) return;
    
    if (searchQuery.trim() === '') {
      // Only show non-archived columns
      setFilteredColumns(columns.filter(column => !column.is_archive));
      return;
    }

    const searchLower = searchQuery.toLowerCase();
    const filtered = columns
      .filter(column => !column.is_archive) // Filter out archived columns
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

    // Handle column reordering
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

    // Handle card movement
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

  // Sort columns by order
  const sortedColumns = [...(filteredColumns || [])].sort((a, b) => 
    (a.order || 0) - (b.order || 0)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} onSignOut={onSignOut} />
      
      {showDashboardList ? (
        <div className="flex-grow bg-gray-50">
          <DashboardList onDashboardSelect={handleDashboardSelect} />
        </div>
      ) : (
        <div 
          className="flex-grow p-8 transition-all duration-300 bg-cover bg-center"
          style={{
            backgroundImage: currentDashboard?.background 
              ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${currentDashboard.background})`
              : 'linear-gradient(to bottom right, #3B82F6, #8B5CF6)'
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowDashboardList(true)}
                  className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold text-white">
                  {currentDashboard?.title || 'Task Management System'}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
                {currentDashboard && canEditDashboard && (
                  <DashboardSettings
                    dashboard={currentDashboard}
                    onUpdateBackground={handleUpdateBackground}
                  />
                )}
                {canEditDashboard && (
                  <button
                    onClick={() => setIsNewColumnModalOpen(true)}
                    className="bg-white text-blue-500 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                  >
                    <Plus size={20} />
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
                    className="flex gap-6 overflow-x-auto pb-4 items-start"
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
    </div>
  );
}

export default Dashboard;