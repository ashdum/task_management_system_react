import React, { useState } from 'react';
import { Settings, Image as ImageIcon, X, UserPlus, Mail, Shield, Layout } from 'lucide-react';
import { Dashboard, User } from '../types';
import { useBoardStore } from '../store';

// Organized background categories
const PREDEFINED_BACKGROUNDS = {
  gradients: [
    {
      id: 'gradient-1',
      url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
      thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&q=80',
      name: 'Aurora',
      category: 'Gradients',
    },
    {
      id: 'gradient-2',
      url: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5',
      thumbnail: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=200&q=80',
      name: 'Ocean Breeze',
      category: 'Gradients',
    },
    {
      id: 'gradient-3',
      url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d',
      thumbnail: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=200&q=80',
      name: 'Sunset Glow',
      category: 'Gradients',
    }
  ],
  nature: [
    {
      id: 'nature-1',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
      thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&q=80',
      name: 'Mountain Lake',
      category: 'Nature',
    },
    {
      id: 'nature-2',
      url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b',
      thumbnail: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200&q=80',
      name: 'Forest Path',
      category: 'Nature',
    },
    {
      id: 'nature-3',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
      thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&q=80',
      name: 'Sunlit Forest',
      category: 'Nature',
    }
  ],
  abstract: [
    {
      id: 'abstract-1',
      url: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3',
      thumbnail: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=200&q=80',
      name: 'Fluid Art',
      category: 'Abstract',
    },
    {
      id: 'abstract-2',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80',
      name: 'Geometric Shapes',
      category: 'Abstract',
    },
    {
      id: 'abstract-3',
      url: 'https://images.unsplash.com/photo-1507908708918-778587c9e563',
      thumbnail: 'https://images.unsplash.com/photo-1507908708918-778587c9e563?w=200&q=80',
      name: 'Color Burst',
      category: 'Abstract',
    }
  ],
  minimal: [
    {
      id: 'minimal-1',
      url: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7',
      thumbnail: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=200&q=80',
      name: 'Clean Lines',
      category: 'Minimal',
    },
    {
      id: 'minimal-2',
      url: 'https://images.unsplash.com/photo-1557683311-eac922347aa1',
      thumbnail: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=200&q=80',
      name: 'Simple Geometry',
      category: 'Minimal',
    },
    {
      id: 'minimal-3',
      url: 'https://images.unsplash.com/photo-1557683316-973673baf926',
      thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&q=80',
      name: 'Minimalist Pattern',
      category: 'Minimal',
    }
  ],
  patterns: [
    {
      id: 'pattern-1',
      url: 'https://images.unsplash.com/photo-1554755229-ca4470e07232',
      thumbnail: 'https://images.unsplash.com/photo-1554755229-ca4470e07232?w=200&q=80',
      name: 'Geometric Pattern',
      category: 'Patterns',
    },
    {
      id: 'pattern-2',
      url: 'https://images.unsplash.com/photo-1550537687-c91072c4792d',
      thumbnail: 'https://images.unsplash.com/photo-1550537687-c91072c4792d?w=200&q=80',
      name: 'Wave Pattern',
      category: 'Patterns',
    },
    {
      id: 'pattern-3',
      url: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7',
      thumbnail: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=200&q=80',
      name: 'Grid Pattern',
      category: 'Patterns',
    }
  ]
};

interface DashboardSettingsProps {
  dashboard: Dashboard;
  onUpdateBackground: (background: string) => void;
}

const DashboardSettings: React.FC<DashboardSettingsProps> = ({
  dashboard,
  onUpdateBackground,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof PREDEFINED_BACKGROUNDS>('gradients');
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

  const getUserInitials = (email: string | undefined) => {
    if (!email) return '??';
    return email
      .split('@')[0]
      .split('.')
      .map(part => part[0]?.toUpperCase() || '')
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
                  {Object.keys(PREDEFINED_BACKGROUNDS).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category as keyof typeof PREDEFINED_BACKGROUNDS)}
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
                  {PREDEFINED_BACKGROUNDS[selectedCategory].map(bg => (
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
                        <span className="text-white text-sm font-medium">
                          {bg.name}
                        </span>
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
                    {dashboard.members.map(member => (
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
                      .filter(inv => inv.status === 'pending')
                      .map(invitation => (
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