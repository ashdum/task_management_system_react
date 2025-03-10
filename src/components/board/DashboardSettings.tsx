// src/components/board/DashboardSettings.tsx
// Dashboard settings component – optimized to load background data from resources

import React, { useState } from 'react';
import { Settings, Image as ImageIcon, X, UserPlus, Mail, Shield } from 'lucide-react';
import { Dashboard } from '../../types';
import { useBoardStore } from '../../store';
import { PREDEFINED_BACKGROUNDS, BackgroundConfig } from '../../resources/backgrounds';

interface DashboardSettingsProps {
  dashboard: Dashboard;
  onUpdateBackground: (background: string) => void;
}

// Define type for background category keys
type BackgroundCategory = keyof BackgroundConfig;

const DashboardSettings: React.FC<DashboardSettingsProps> = ({ dashboard, onUpdateBackground }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BackgroundCategory>('gradients');
  const { inviteToDashboard } = useBoardStore();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(false);

    if (!inviteEmail.trim()) {
      setInviteError('Please enter an email address');
      return;
    }

    try {
      await inviteToDashboard(dashboard.id, inviteEmail);
      setInviteSuccess(true);
      setInviteEmail('');
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : 'Failed to send invitation');
    }
  };

  // Returns initials based on email
  const getUserInitials = (email: string | undefined) => {
    if (!email) return '??';
    return email
      .split('@')[0]
      .split('.')
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
  };

  return (
    <>
      <div className="ml-auto">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Dashboard Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50">
          <div className="w-96 h-full bg-white shadow-xl overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Dashboard Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Background Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <ImageIcon size={16} />
                  Background
                </h3>

                {/* Category Tabs */}
                <div className="flex overflow-x-auto mb-4 pb-2 -mx-4 px-4 space-x-2">
                  {(Object.keys(PREDEFINED_BACKGROUNDS) as BackgroundCategory[]).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Background Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {PREDEFINED_BACKGROUNDS[selectedCategory].map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => onUpdateBackground(bg.url)}
                      className={`relative aspect-video rounded-lg overflow-hidden group ${
                        dashboard.background === bg.url ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <img
                        src={bg.thumbnail}
                        alt={bg.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-medium">{bg.name}</span>
                      </div>
                      {dashboard.background === bg.url && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <span className="w-3 h-3 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Invite Members Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <UserPlus size={16} />
                  Invite Members
                </h3>

                <form onSubmit={handleInvite} className="space-y-3">
                  <div>
                    <div className="relative">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    {inviteError && (
                      <p className="mt-1 text-sm text-red-600">{inviteError}</p>
                    )}
                    {inviteSuccess && (
                      <p className="mt-1 text-sm text-green-600">Invitation sent successfully!</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <UserPlus size={16} />
                    Send Invitation
                  </button>
                </form>
              </div>

              {/* Members List */}
              {dashboard.members && dashboard.members.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Members</h3>
                  <div className="space-y-2">
                    {dashboard.members.map((member) => (
                      member && (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {getUserInitials(member.email)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{member.email}</p>
                              {dashboard.ownerIds.includes(member.id) && (
                                <p className="text-xs text-blue-600 flex items-center gap-1">
                                  <Shield size={12} />
                                  Owner
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Invitations */}
              {dashboard.invitations && dashboard.invitations.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Pending Invitations</h3>
                  <div className="space-y-2">
                    {dashboard.invitations
                      .filter((inv) => inv.status === 'pending')
                      .map((invitation) => (
                        <div
                          key={invitation.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                        >
                          <div>
                            <p className="text-sm text-gray-900">{invitation.inviteeEmail}</p>
                            <p className="text-xs text-gray-500">
                              Invited by {invitation.inviterEmail}
                            </p>
                          </div>
                          <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                            Pending
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardSettings;
