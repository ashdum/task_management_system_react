import React, { useState, useEffect } from 'react';
import { Plus, Layout, Users, Shield, Star, Clock, Search, Grid, List } from 'lucide-react';
import { useBoardStore } from '../store';
import { getCurrentUser } from '../lib/auth';
import { Dashboard } from '../types';

// Default gradient for dashboard background when none is set
const DEFAULT_GRADIENT = 'linear-gradient(to bottom right, #3B82F6, #8B5CF6)';

// Create a separate component for the new dashboard form
const NewDashboardForm = ({ onSubmit }: { onSubmit: (title: string) => void }) => {
  const [newDashboardTitle, setNewDashboardTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDashboardTitle.trim()) {
      onSubmit(newDashboardTitle.trim());
      setNewDashboardTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={newDashboardTitle}
        onChange={(e) => setNewDashboardTitle(e.target.value)}
        placeholder="New dashboard name..."
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={!newDashboardTitle.trim()}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        <Plus size={20} />
        Create Dashboard
      </button>
    </form>
  );
};

interface Props {
  onDashboardSelect: (dashboardId: string) => void;
}

const DashboardList: React.FC<Props> = ({ onDashboardSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'starred'>('recent');
  const { dashboards, addDashboard, loadDashboards } = useBoardStore();
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadDashboards();
  }, [loadDashboards]);

  const filteredDashboards = dashboards
    .filter(dashboard => {
      if (!searchQuery.trim()) return true;
      return dashboard.title.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

  const ownedDashboards = filteredDashboards.filter(
    dashboard => currentUser && dashboard.ownerIds?.includes(currentUser.id)
  );

  const memberDashboards = filteredDashboards.filter(
    dashboard => 
      currentUser && 
      !dashboard.ownerIds?.includes(currentUser.id) && 
      dashboard.members?.some(member => member?.id === currentUser.id)
  );

  const handleCreateDashboard = async (title: string) => {
    if (currentUser) {
      await addDashboard(title);
    }
  };

  const getUserInitials = (email: string = '') => {
    if (!email) return '??';
    return email
      .split('@')[0]
      .split('.')
      .map(part => part[0]?.toUpperCase() || '')
      .join('');
  };

  const DashboardCard = ({ dashboard }: { dashboard: Dashboard }) => {
    if (!dashboard || !currentUser) return null;

    const isOwner = dashboard.ownerIds?.includes(currentUser.id) || false;
    const memberCount = dashboard.members?.length || 0;

    if (viewMode === 'grid') {
      return (
        <button
          onClick={() => onDashboardSelect(dashboard.id)}
          className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-[280px]"
        >
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{
              background: dashboard.background 
                ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6)), url(${dashboard.background})`
                : DEFAULT_GRADIENT,
            }}
          />
          
          <div className="relative h-full p-6 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors">
                  {dashboard.title}
                </h3>
                <div className="flex items-center gap-2">
                  {isOwner && <Shield size={16} className="text-white" />}
                  <div className="flex items-center gap-1 text-white/90">
                    <Users size={16} />
                    <span className="text-sm">{memberCount}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-white/80">
                <Clock size={14} />
                <span>Created {new Date(dashboard.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {dashboard.members && dashboard.members.length > 0 && (
              <div className="flex -space-x-2 mt-2">
                {dashboard.members.slice(0, 3).map(member => (
                  member && (
                    <div
                      key={member.id}
                      className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20"
                      title={member.email}
                    >
                      <span className="text-xs text-white font-medium">
                        {getUserInitials(member.email)}
                      </span>
                    </div>
                  )
                ))}
                {dashboard.members.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20">
                    <span className="text-xs text-white">
                      +{dashboard.members.length - 3}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </button>
      );
    }

    return (
      <button
        onClick={() => onDashboardSelect(dashboard.id)}
        className="w-full p-4 rounded-lg hover:shadow-md transition-all duration-300 flex items-center justify-between group overflow-hidden relative"
      >
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            background: dashboard.background 
              ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${dashboard.background})`
              : DEFAULT_GRADIENT,
          }}
        />

        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white group-hover:text-white/90 transition-colors">
                {dashboard.title}
              </h3>
              <p className="text-sm text-white/80">
                Created {new Date(dashboard.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {dashboard.members && dashboard.members.length > 0 && (
              <div className="flex -space-x-2">
                {dashboard.members.slice(0, 3).map(member => (
                  member && (
                    <div
                      key={member.id}
                      className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20"
                      title={member.email}
                    >
                      <span className="text-xs text-white font-medium">
                        {getUserInitials(member.email)}
                      </span>
                    </div>
                  )
                ))}
                {dashboard.members.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20">
                    <span className="text-xs text-white">
                      +{dashboard.members.length - 3}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              {isOwner && <Shield size={16} className="text-white" />}
              <div className="flex items-center gap-1 text-white/90">
                <Users size={16} />
                <span className="text-sm">{memberCount}</span>
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Layout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Please sign in</h3>
          <p className="text-gray-500">
            You need to be signed in to view and create dashboards
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentUser.fullName || currentUser.email.split('@')[0]}'s Dashboards
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dashboards..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
                }`}
              >
                <List size={20} />
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'recent' | 'starred')}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Recently Created</option>
              <option value="name">Name</option>
              <option value="starred">Starred</option>
            </select>
          </div>
        </div>

        <NewDashboardForm onSubmit={handleCreateDashboard} />
      </div>

      <div className="space-y-8">
        {ownedDashboards.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-blue-600" />
              Owned by you
            </h3>
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
            }>
              {ownedDashboards.map(dashboard => (
                <DashboardCard key={dashboard.id} dashboard={dashboard} />
              ))}
            </div>
          </div>
        )}

        {memberDashboards.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              Shared with you
            </h3>
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
            }>
              {memberDashboards.map(dashboard => (
                <DashboardCard key={dashboard.id} dashboard={dashboard} />
              ))}
            </div>
          </div>
        )}

        {dashboards.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Layout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No dashboards yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first dashboard to get started
            </p>
            <button
              onClick={() => document.querySelector('input')?.focus()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardList;