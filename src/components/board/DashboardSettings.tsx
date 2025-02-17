import React, { useState, useEffect } from 'react';
import { Settings, Users, Shield, Image, Trash2, Mail } from 'lucide-react';
import { useBoardStore } from '../../store';
import { FormField } from '../common/FormField';
import { InfoTooltip } from '../common/InfoTooltip';
import { Dashboard, User } from '../../types';
import { loadBackgroundResources } from '../../utils/resourceLoader';

// Type for background categories
type BackgroundCategory = 'gradients' | 'colors' | 'images';

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
  const [inviteError, setInviteError] = useState<string | undefined>();
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BackgroundCategory>('gradients');
  const [backgrounds, setBackgrounds] = useState<Record<string, string[]>>({
    gradients: [],
    colors: [],
    images: []
  });
  const { inviteToDashboard } = useBoardStore();

  useEffect(() => {
    const loadResources = async () => {
      const loadedBackgrounds = await loadBackgroundResources();
      setBackgrounds(loadedBackgrounds);
    };
    loadResources();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(undefined);
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

  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Dashboard Settings"
      >
        <Settings size={20} className="text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-6">
            {/* Background Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Image size={16} />
                Background
                <InfoTooltip content="Choose a background image or gradient for your dashboard. Changes will be visible to all members." />
              </h3>

              {/* Category Tabs */}
              <div className="flex space-x-2 mb-4">
                {Object.keys(backgrounds).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category as BackgroundCategory)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      selectedCategory === category
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>

              {/* Background Options */}
              <div className="grid grid-cols-5 gap-2">
                {backgrounds[selectedCategory].map((background, index) => (
                  <button
                    key={index}
                    onClick={() => onUpdateBackground(background)}
                    className={`w-full aspect-square rounded-lg border-2 ${
                      dashboard.background === background
                        ? 'border-blue-500'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    style={{
                      background: selectedCategory === 'images' ? `url(${background})` : background,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Invite Members Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Users size={16} />
                Invite Members
                <InfoTooltip content="Invite team members to collaborate on this dashboard. They will be able to view and edit cards." />
              </h3>

              <form onSubmit={handleInvite} className="space-y-3">
                <FormField
                  label="Email Address"
                  error={inviteError}
                >
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
                  {inviteSuccess && (
                    <p className="mt-1 text-sm text-green-600">Invitation sent successfully!</p>
                  )}
                </FormField>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Users size={16} />
                  Send Invitation
                </button>
              </form>
            </div>

            {/* Members List */}
            {dashboard.members && dashboard.members.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  Members
                  <InfoTooltip content="Current members of this dashboard. Owners have additional permissions like managing members and dashboard settings." />
                </h3>
                <div className="space-y-2">
                  {dashboard.members.map((member: User) => (
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
      )}
    </div>
  );
};

export default DashboardSettings;