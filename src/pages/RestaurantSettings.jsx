import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBranches, getSettings, updateSettings } from '../services/api';
import Sidebar from '../components/Sidebar';
import AlertDialog from '../components/AlertDialog';

export default function RestaurantSettings() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [isGlobalSettings, setIsGlobalSettings] = useState(true);
  const [formData, setFormData] = useState({
    restaurant_name: '',
    opening_time: '',
    closing_time: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchingSettings, setFetchingSettings] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  // Load branches on mount
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const response = await getBranches();
        // Handle different possible response structures for branches
        const branchesData = response.data.data || response.data || [];
        const activeBranches = Array.isArray(branchesData)
          ? branchesData.filter(b => b.is_active)
          : [];
        setBranches(activeBranches);
      } catch (error) {
        console.error('Failed to load branches:', error);
        setAlert({
          isOpen: true,
          title: 'Error',
          message: 'Failed to load branches',
          type: 'error'
        });
      }
    };
    loadBranches();
  }, []);

  // Load settings when branch selection changes
  useEffect(() => {
    const loadSettings = async () => {
      setFetchingSettings(true);
      try {
        const branchId = isGlobalSettings ? null : selectedBranchId;
        const response = await getSettings(branchId);
        setFormData({
          restaurant_name: response.data.data.restaurant_name || '',
          opening_time: response.data.data.opening_time || '',
          closing_time: response.data.data.closing_time || '',
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
        setAlert({
          isOpen: true,
          title: 'Error',
          message: 'Failed to load settings',
          type: 'error'
        });
      } finally {
        setFetchingSettings(false);
      }
    };

    loadSettings();
  }, [selectedBranchId, isGlobalSettings]);

  const handleBranchTypeChange = (e) => {
    const value = e.target.value;
    setIsGlobalSettings(value === 'global');
    if (value === 'global') {
      setSelectedBranchId(null);
    } else if (branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
  };

  const handleBranchChange = (e) => {
    setSelectedBranchId(parseInt(e.target.value));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
      };

      if (!isGlobalSettings) {
        dataToSend.branch_id = selectedBranchId;
      }

      await updateSettings(dataToSend);
      setAlert({
        isOpen: true,
        title: 'Success',
        message: `Settings updated successfully for ${isGlobalSettings ? 'all branches' : 'selected branch'}`,
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      setAlert({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update settings',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Restaurant Settings</h1>
                  <p className="text-sm text-gray-600 mt-1">Configure your restaurant's operational settings</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings Management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Branch Selector Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Settings Scope</h2>
              <div className="space-y-4">
                {/* Global or Branch-specific */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apply settings to:
                  </label>
                  <select
                    value={isGlobalSettings ? 'global' : 'branch'}
                    onChange={handleBranchTypeChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="global">All Branches (Global Settings)</option>
                    <option value="branch">Specific Branch</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-600">
                    {isGlobalSettings
                      ? 'Global settings apply to all branches unless overridden by branch-specific settings'
                      : 'Branch-specific settings override global settings for the selected branch'}
                  </p>
                </div>

                {/* Branch Selection (only visible when not global) */}
                {!isGlobalSettings && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Branch:
                    </label>
                    <select
                      value={selectedBranchId || ''}
                      onChange={handleBranchChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name} ({branch.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Settings Form */}
            {fetchingSettings ? (
              <div className="px-6 py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <p className="text-gray-600">Loading settings...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                {/* Restaurant Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Restaurant Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="restaurant_name"
                      value={formData.restaurant_name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter restaurant name"
                    />
                  </div>
                </div>

                {/* Opening Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Opening Time
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="time"
                      name="opening_time"
                      value={formData.opening_time}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">24-hour format (e.g., 16:00 for 4 PM)</p>
                </div>

                {/* Closing Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Closing Time
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="time"
                      name="closing_time"
                      value={formData.closing_time}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">24-hour format (e.g., 04:00 for 4 AM)</p>
                </div>

                {/* Operating Hours Display */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Operating Hours Preview</p>
                      <p>
                        {formData.opening_time && formData.closing_time
                          ? `${formData.opening_time} - ${formData.closing_time}`
                          : 'Please enter opening and closing times'}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Applies to: {isGlobalSettings ? 'All Branches' : branches.find(b => b.id === selectedBranchId)?.name || 'Selected Branch'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Settings
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}
