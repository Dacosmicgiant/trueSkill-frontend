// src/pages/Settings.jsx
import { useState, useEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { 
  UserCircle, 
  Bell, 
  Key, 
  Settings as SettingsIcon,
  Copy,
  RotateCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/authService';
import {
  Button,
  Input,
  PageHeader,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  Alert,
  Checkbox
} from '../components/ui';

// Tab definitions
const tabs = [
  { id: 'profile', name: 'Profile', icon: UserCircle },
  { id: 'account', name: 'Account', icon: SettingsIcon },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'api', name: 'API Access', icon: Key },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { user, updateUserData } = useAuth();
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
  });

  const [notificationForm, setNotificationForm] = useState({
    emailNotifications: true,
    newCandidates: true,
    applicationUpdates: true,
    weeklyDigest: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [apiKey] = useState('sk_test_7f8d3g2h1j5k4l6m9n0p');

  useEffect(() => {
    // Populate form with user data when available
    if (user) {
      // Split the name into first and last name (assumes space-separated names)
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setProfileForm({
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        position: user.position || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (name, checked) => {
    setNotificationForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Prepare the data for API
      const userData = {
        name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
        email: profileForm.email,
        company: profileForm.company,
        position: profileForm.position,
        phone: profileForm.phone,
      };

      const { success, user: updatedUser, error } = await updateUserProfile(userData);
      
      if (success) {
        setSuccess('Profile updated successfully');
        // Update local user context if available
        if (updateUserData && updatedUser) {
          updateUserData(updatedUser);
        }
      } else {
        setError(error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
      
      // Hide success message after a delay
      if (success) {
        setTimeout(() => setSuccess(''), 3000);
      }
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      setIsSaving(false);
      return;
    }

    try {
      // Send only the password fields
      const { success, error } = await updateUserProfile({
        currentPassword: passwordForm.currentPassword,
        password: passwordForm.newPassword,
      });
      
      if (success) {
        setSuccess('Password updated successfully');
        // Clear the password form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(error || 'Failed to update password');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
      
      // Hide success message after a delay
      if (success) {
        setTimeout(() => setSuccess(''), 3000);
      }
    }
  };

  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess('');
    setError('');

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSuccess('Notification preferences saved');
      
      // Hide success message after a delay
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Settings" />

      {success && <Alert variant="success" className="mb-6">{success}</Alert>}
      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      <Card>
        {/* Mobile dropdown for tabs */}
        <div className="sm:hidden p-4">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.name}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop tabs */}
        <div className="hidden sm:block border-b border-gray-200">
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="flex">
              {tabs.map((tab) => (
                <Tabs.Trigger
                  key={tab.id}
                  value={tab.id}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className={`h-5 w-5 mr-2 ${
                    activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'
                  }`} />
                  {tab.name}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs.Root>
        </div>

        <CardContent className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex items-center mb-6">
                <img
                  className="h-16 w-16 rounded-full bg-gray-300"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Profile"
                />
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
                  <Button variant="ghost" size="sm" className="mt-1 p-0 h-auto">Change</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <Input
                  id="firstName"
                  name="firstName"
                  label="First name"
                  value={profileForm.firstName}
                  onChange={handleProfileChange}
                />

                <Input
                  id="lastName"
                  name="lastName"
                  label="Last name"
                  value={profileForm.lastName}
                  onChange={handleProfileChange}
                />

                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Email address"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                />

                <Input
                  id="phone"
                  name="phone"
                  label="Phone number"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                />

                <Input
                  id="company"
                  name="company"
                  label="Company"
                  value={profileForm.company}
                  onChange={handleProfileChange}
                />

                <Input
                  id="position"
                  name="position"
                  label="Position"
                  value={profileForm.position}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="pt-5 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  disabled={isSaving}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Security</h3>
                <Checkbox
                  id="twoFactorEnabled"
                  defaultChecked={true}
                  label="Enable two-factor authentication"
                  description="Add an extra layer of security to your account with a verification code."
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Password</h3>
                <form className="space-y-6" onSubmit={handleSavePassword}>
                  <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div className="sm:col-span-2">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        label="Current password"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>

                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      label="New password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />

                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      label="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSaving}
                      disabled={isSaving}
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleSaveNotifications} className="space-y-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Email Notifications</h3>
              <div className="space-y-4">
                <Checkbox
                  id="emailNotifications"
                  checked={notificationForm.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                  label="Enable Email Notifications"
                  description="Master toggle for all email notifications."
                />

                <div className={`${notificationForm.emailNotifications ? '' : 'opacity-50 pointer-events-none'} ml-6 mt-4 pl-4 border-l-2 border-gray-200 space-y-4`}>
                  <Checkbox
                    id="newCandidates"
                    checked={notificationForm.newCandidates}
                    onCheckedChange={(checked) => handleNotificationChange('newCandidates', checked)}
                    disabled={!notificationForm.emailNotifications}
                    label="New Candidate Applications"
                    description="Email when a new candidate applies for a job."
                  />

                  <Checkbox
                    id="applicationUpdates"
                    checked={notificationForm.applicationUpdates}
                    onCheckedChange={(checked) => handleNotificationChange('applicationUpdates', checked)}
                    disabled={!notificationForm.emailNotifications}
                    label="Application Status Updates"
                    description="Get notified when application status changes."
                  />

                  <Checkbox
                    id="weeklyDigest"
                    checked={notificationForm.weeklyDigest}
                    onCheckedChange={(checked) => handleNotificationChange('weeklyDigest', checked)}
                    disabled={!notificationForm.emailNotifications}
                    label="Weekly Digest"
                    description="A weekly summary of all account activity."
                  />
                </div>
              </div>

              <div className="pt-5 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  disabled={isSaving}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* API Access Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">API Access</h3>
              <p className="text-sm text-gray-500 mb-4">
                Use these credentials to authenticate your API requests.
              </p>
              
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">API Key</h4>
                      <div className="flex items-center">
                        <Input
                          type="password"
                          value={apiKey}
                          readOnly
                          className="w-64 bg-gray-100"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="ml-2"
                          onClick={() => {
                            navigator.clipboard.writeText(apiKey);
                            setSuccess('API key copied to clipboard');
                            setTimeout(() => setSuccess(''), 3000);
                          }}
                          leftIcon={<Copy className="h-4 w-4" />}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => {
                        setSuccess('API key regenerated successfully');
                        setTimeout(() => setSuccess(''), 3000);
                      }}
                      leftIcon={<RotateCw className="h-4 w-4" />}
                    >
                      Regenerate
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    This key grants full access to the API. Keep it secure and do not share it publicly.
                  </p>
                </CardContent>
              </Card>

              <div className="mt-4">
                <a href="/api/docs" target="_blank" className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center">
                  View API documentation <span className="ml-1">→</span>
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}