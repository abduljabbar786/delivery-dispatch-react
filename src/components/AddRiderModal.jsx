import { useState, useEffect } from 'react';
import { getBranches } from '../services/api';
import AlertDialog from './AlertDialog';

export default function AddRiderModal({ onClose, onCreateRider }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    branch_id: '',
  });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'error' });

  // Load branches on mount
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const response = await getBranches();

        // Handle different possible response structures
        const branchesData = response.data.data || response.data || [];
        const branchesArray = Array.isArray(branchesData) ? branchesData : [];
        const activeBranches = branchesArray.filter(b => b.is_active);

        console.log('AddRiderModal - Loaded branches:', branchesArray);
        setBranches(activeBranches);

        // Auto-select first branch if only one exists
        if (activeBranches.length === 1) {
          setFormData(prev => ({ ...prev, branch_id: activeBranches[0].id }));
        }
      } catch (error) {
        console.error('Failed to load branches:', error);
        setBranches([]);
      }
    };
    loadBranches();
  }, []);

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
      // Filter out empty fields and convert branch_id to integer
      const riderData = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== '') {
          // Convert branch_id to integer
          if (key === 'branch_id') {
            riderData[key] = parseInt(formData[key], 10);
          } else {
            riderData[key] = formData[key];
          }
        }
      });

      // Set rider's initial location to the branch location
      const selectedBranch = branches.find(b => b.id === parseInt(formData.branch_id, 10));
      if (selectedBranch && selectedBranch.latitude && selectedBranch.longitude) {
        // If branch has location, use it
        riderData.latest_lat = selectedBranch.latitude;
        riderData.latest_lng = selectedBranch.longitude;
      } else {
        // Fallback to null if branch location not available
        riderData.latest_lat = null;
        riderData.latest_lng = null;
      }

      console.log('Creating rider with data:', riderData);
      await onCreateRider(riderData);
      onClose();
    } catch (error) {
      console.error('Failed to create rider:', error);
      // Log detailed error for debugging but show generic message to user
      if (error.response?.data) {
        console.error('Server error details:', error.response.data);
      }
      setAlert({
        isOpen: true,
        title: 'Unable to Add Rider',
        message: 'We encountered an issue while adding the rider. Please check the information and try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-900">Add New Rider</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Rider Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rider Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., John Doe"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Rider Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., +92 300 1234567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">Optional contact number for the rider</p>
          </div>

          {/* Branch Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch <span className="text-red-500">*</span>
            </label>
            <select
              name="branch_id"
              value={formData.branch_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-md hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Rider'}
            </button>
          </div>
        </form>
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
