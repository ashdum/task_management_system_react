// src\components\statistics\DashboardStats.tsx
import React, { useState } from 'react';
import { 
  BarChart3, X, Users, Layout,
  CheckSquare, MessageSquare, 
} from 'lucide-react';
import { Dashboard, DashboardStats as DashboardStatsType, StatFilter } from '../../services/data/interface/dataTypes';

interface DashboardStatsProps {
  dashboard: Dashboard;
  isOpen: boolean;
  onClose: () => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  dashboard,
  isOpen,
  onClose,
}) => {
  const [filter, setFilter] = useState<StatFilter>({
    dateRange: 'all',
    members: [],
    labels: [],
    columns: [],
  });

  const calculateStats = (): DashboardStatsType => {
    const stats: DashboardStatsType = {
      totalCards: 0,
      completedCards: 0,
      totalMembers: dashboard.members.length,
      totalComments: 0,
      totalAttachments: 0,
      totalChecklists: 0,
      completedChecklists: 0,
      cardsByLabel: {},
      cardsByMember: {},
      cardsByColumn: {},
      activityByDay: {},
      completionRate: 0,
    };

    // Apply filters
    const startDate = getStartDate(filter.dateRange);
    const now = new Date().toISOString().split('T')[0]; // Today's date for default activity

    dashboard.columns.forEach(column => {
      if (filter.columns.length > 0 && !filter.columns.includes(column.id)) {
        return;
      }

      stats.cardsByColumn[column.title] = 0;

      column.cards.forEach(card => {
        // Safely handle card date - default to dashboard creation date if card date is missing
        const cardDate = card.createdAt 
          ? new Date(card.createdAt)
          : new Date(dashboard.createdAt);

        if (startDate && cardDate < startDate) {
          return;
        }

        // Filter by members
        if (filter.members.length > 0 && 
            !card.members.some(member => filter.members.includes(member.id))) {
          return;
        }

        // Filter by labels
        if (filter.labels.length > 0 && 
            !card.labels.some(label => filter.labels.includes(label.id))) {
          return;
        }

        stats.totalCards++;
        stats.cardsByColumn[column.title]++;

        // Count comments
        stats.totalComments += card.comments.length;

        // Count attachments
        stats.totalAttachments += card.attachments?.length || 0;

        // Process checklists
        card.checklists.forEach(checklist => {
          stats.totalChecklists++;
          const completedItems = checklist.items.filter(item => item.completed).length;
          if (completedItems === checklist.items.length) {
            stats.completedChecklists++;
          }
        });

        // Process labels
        card.labels.forEach(label => {
          stats.cardsByLabel[label.text] = (stats.cardsByLabel[label.text] || 0) + 1;
        });

        // Process members
        card.members.forEach(member => {
          stats.cardsByMember[member.email] = (stats.cardsByMember[member.email] || 0) + 1;
        });

        // Process activity by day - ensure we have a valid date
        try {
          const day = cardDate.toISOString().split('T')[0];
          stats.activityByDay[day] = (stats.activityByDay[day] || 0) + 1;
        } catch (error) {
          // If date is invalid, count it for today
          stats.activityByDay[now] = (stats.activityByDay[now] || 0) + 1;
        }
      });
    });

    // Calculate completion rate
    const doneColumn = dashboard.columns.find(col => 
      col.title.toLowerCase().includes('done') || 
      col.title.toLowerCase().includes('completed')
    );
    if (doneColumn) {
      stats.completedCards = doneColumn.cards.length;
      stats.completionRate = stats.totalCards > 0 
        ? (stats.completedCards / stats.totalCards) * 100 
        : 0;
    }

    return stats;
  };

  const getStartDate = (range: string): Date | null => {
    const now = new Date();
    switch (range) {
      case 'today':
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        return today;
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return weekAgo;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return monthAgo;
      case 'year':
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return yearAgo;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const stats = calculateStats();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50">
      <div className="w-96 h-full bg-white shadow-xl overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            Dashboard Statistics
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Filters */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Filters</h3>
            
            <div>
              <label className="text-sm text-gray-600">Date Range</label>
              <select
                value={filter.dateRange}
                onChange={(e) => setFilter({ ...filter, dateRange: e.target.value as any })}
                className="mt-1 block w-full px-3 py-2 bg-white border rounded-lg text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">Members</label>
              <div className="mt-1 space-y-2">
                {dashboard.members.map(member => (
                  <label key={member.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filter.members.includes(member.id)}
                      onChange={(e) => {
                        const newMembers = e.target.checked
                          ? [...filter.members, member.id]
                          : filter.members.filter(id => id !== member.id);
                        setFilter({ ...filter, members: newMembers });
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">{member.email}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Labels</label>
              <div className="mt-1 space-y-2">
                {Array.from(new Set(
                  dashboard.columns.flatMap(col => 
                    col.cards.flatMap(card => card.labels)
                  )
                )).map(label => (
                  <label key={label.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filter.labels.includes(label.id)}
                      onChange={(e) => {
                        const newLabels = e.target.checked
                          ? [...filter.labels, label.id]
                          : filter.labels.filter(id => id !== label.id);
                        setFilter({ ...filter, labels: newLabels });
                      }}
                      className="rounded text-blue-600"
                    />
                    <span 
                      className="text-sm px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Layout size={16} />
                <span className="text-sm font-medium">Total Cards</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{stats.totalCards}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <CheckSquare size={16} />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {stats.completionRate.toFixed(1)}%
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Users size={16} />
                <span className="text-sm font-medium">Members</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">{stats.totalMembers}</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <MessageSquare size={16} />
                <span className="text-sm font-medium">Comments</span>
              </div>
              <p className="text-2xl font-bold text-orange-700">{stats.totalComments}</p>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="space-y-6">
            {/* Cards by Column */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Cards by Column</h3>
              <div className="space-y-2">
                {Object.entries(stats.cardsByColumn).map(([column, count]) => (
                  <div key={column} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{
                            width: `${(count / stats.totalCards) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 min-w-[4rem]">
                      {column}: {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cards by Label */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Cards by Label</h3>
              <div className="space-y-2">
                {Object.entries(stats.cardsByLabel).map(([label, count]) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{
                            width: `${(count / stats.totalCards) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 min-w-[4rem]">
                      {label}: {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Timeline */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Activity Timeline</h3>
              <div className="space-y-2">
                {Object.entries(stats.activityByDay)
                  .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                  .slice(0, 7)
                  .map(([date, count]) => (
                    <div key={date} className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{
                              width: `${(count / Math.max(...Object.values(stats.activityByDay))) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 min-w-[8rem]">
                        {new Date(date).toLocaleDateString()}: {count}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;