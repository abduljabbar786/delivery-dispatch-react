import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getOrders, getSettings, getBranches } from '../services/api';
import Sidebar from '../components/Sidebar';
import Logo from '../components/Logo';
import AlertDialog from '../components/AlertDialog';

export default function OrdersHistory() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [restaurantSettings, setRestaurantSettings] = useState(null);
  const [branches, setBranches] = useState([]);
  const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'error' });

  // Filter states - separate pending and applied filters
  const [pendingFilters, setPendingFilters] = useState({
    status: 'all',
    search: '',
    date: 'all',
    branch: 'all',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: 'all',
    search: '',
    date: 'all',
    branch: 'all',
  });

  // Pagination states - server-side
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (filters = null, page = 1) => {
    try {
      setFiltering(!!filters);

      // Build query params from filters + pagination
      const params = {
        page: page,
        per_page: itemsPerPage,
      };

      if (filters) {
        if (filters.status !== 'all') params.status = filters.status;
        if (filters.search) params.search = filters.search;
        if (filters.branch !== 'all') params.branch_id = filters.branch;
        if (filters.date !== 'all') params.date_filter = filters.date;
      }

      const [ordersRes, settingsRes, branchesRes] = await Promise.all([
        getOrders(params),
        getSettings(),
        getBranches(),
      ]);

      // Handle Laravel pagination response
      const ordersData = ordersRes.data;
      if (ordersData.data) {
        // Laravel pagination format: { data: [], current_page, last_page, total, per_page }
        setOrders(ordersData.data);
        setCurrentPage(ordersData.current_page || page);
        setTotalPages(ordersData.last_page || 1);
        setTotalItems(ordersData.total || 0);
      } else {
        // Fallback if not paginated
        setOrders(ordersData || []);
        setTotalItems(ordersData?.length || 0);
        setTotalPages(1);
      }

      setRestaurantSettings(settingsRes.data.data || {});

      // Handle different possible response structures for branches
      const branchesData = branchesRes.data.data || branchesRes.data || [];
      console.log('Loaded branches:', branchesData);
      setBranches(Array.isArray(branchesData) ? branchesData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setAlert({
        isOpen: true,
        title: 'Unable to Load Orders',
        message: 'We are having trouble loading the order history. Please refresh the page and try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setFiltering(false);
    }
  };

  const handleApplyFilters = async () => {
    setAppliedFilters(pendingFilters);
    setCurrentPage(1);
    await loadData(pendingFilters, 1);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: 'all',
      search: '',
      date: 'all',
      branch: 'all',
    };
    setPendingFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setCurrentPage(1);
    loadData(clearedFilters, 1);
  };

  const handlePageChange = async (pageNumber) => {
    if (pageNumber === currentPage || filtering) return; // Prevent duplicate calls
    setCurrentPage(pageNumber);
    setFiltering(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await loadData(appliedFilters, pageNumber);
  };

  // Stats - Note: These are based on current page only
  // For accurate totals, backend should provide aggregated stats
  const stats = {
    total: totalItems, // Total from server
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
    failed: orders.filter((o) => o.status === 'FAILED').length,
    pending: orders.filter((o) => !['DELIVERED', 'FAILED'].includes(o.status)).length,
  };

  // Orders are already paginated from server
  const currentOrders = orders;

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-800';
      case 'PICKED_UP':
        return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED':
        return 'bg-purple-100 text-purple-800';
      case 'UNASSIGNED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-bounce">
            <svg
              className="w-16 h-16 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18 18.5a1.5 1.5 0 01-1.5-1.5 1.5 1.5 0 011.5-1.5 1.5 1.5 0 011.5 1.5 1.5 1.5 0 01-1.5 1.5m1.5-9l1.96 2.5H17V9.5m-11 9A1.5 1.5 0 014.5 17 1.5 1.5 0 016 15.5 1.5 1.5 0 017.5 17 1.5 1.5 0 016 18.5M20 8h-3V4H3c-1.11 0-2 .89-2 2v11h2a3 3 0 003 3 3 3 0 003-3h6a3 3 0 003 3 3 3 0 003-3h2v-5l-3-4z"/>
            </svg>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading Orders History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-60">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="px-4 sm:px-6 py-3 flex justify-between items-center ml-14 lg:ml-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Logo className="h-8 w-8 sm:h-10 sm:w-10" textClassName="text-lg sm:text-xl" />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </div>
              </div>
              <button
                onClick={logout}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Title */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders History</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">View and manage all historical orders</p>
        </div>

        {/* Stats Cards */}
        <div className="px-4 sm:px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.delivered}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.failed}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-6 py-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={pendingFilters.search}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, search: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
                  placeholder="Search by ID, name, or phone..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <select
                  value={pendingFilters.status}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="all">All Statuses</option>
                  <option value="UNASSIGNED">Unassigned</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="PICKED_UP">Picked Up</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>

              {/* Branch Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch
                </label>
                <select
                  value={pendingFilters.branch}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, branch: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="all">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Period
                </label>
                <select
                  value={pendingFilters.date}
                  onChange={(e) => setPendingFilters({ ...pendingFilters, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p className="text-sm text-gray-600">
                {totalItems > 0 ? (
                  <>
                    Showing <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                    <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                    <span className="font-semibold">{totalItems}</span> orders
                  </>
                ) : (
                  <span>No orders found</span>
                )}
              </p>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleClearFilters}
                  disabled={filtering}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear Filters
                </button>
                <button
                  onClick={handleApplyFilters}
                  disabled={filtering}
                  className="flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {filtering ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Applying...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Apply Filters
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table/Cards */}
        <div className="px-4 sm:px-6 py-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
            {/* Loading Overlay */}
            {filtering && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 animate-fade-in">
                <div className="text-center">
                  <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm text-gray-600 font-medium">Loading orders...</p>
                </div>
              </div>
            )}

            {/* Mobile Card View */}
            <div className="md:hidden">
              {currentOrders.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No orders found matching the selected filters
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {currentOrders.map((order, index) => (
                    <div
                      key={order.id}
                      className="p-4 hover:bg-gray-50 transition-all duration-300 hover:shadow-md animate-slide-up-fade-in"
                      style={{animationDelay: `${index * 0.05}s`}}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Order #{order.id}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(order.created_at)}</p>
                        </div>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-all duration-300 ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start">
                          <span className="text-xs font-medium text-gray-500 w-20 flex-shrink-0">Customer:</span>
                          <span className="text-xs text-gray-900">{order.customer_name || 'N/A'}</span>
                        </div>

                        <div className="flex items-start">
                          <span className="text-xs font-medium text-gray-500 w-20 flex-shrink-0">Phone:</span>
                          <span className="text-xs text-gray-900">{order.customer_phone || 'N/A'}</span>
                        </div>

                        <div className="flex items-start">
                          <span className="text-xs font-medium text-gray-500 w-20 flex-shrink-0">Address:</span>
                          <span className="text-xs text-gray-900 line-clamp-2">{order.delivery_address || 'N/A'}</span>
                        </div>

                        <div className="flex items-start">
                          <span className="text-xs font-medium text-gray-500 w-20 flex-shrink-0">Branch:</span>
                          <span className="text-xs text-gray-900">{order.branch?.name || 'N/A'}</span>
                        </div>

                        <div className="flex items-start">
                          <span className="text-xs font-medium text-gray-500 w-20 flex-shrink-0">Rider:</span>
                          <span className="text-xs text-gray-900">{order.rider?.name || 'Unassigned'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        No orders found matching the selected filters
                      </td>
                    </tr>
                  ) : (
                    currentOrders.map((order, index) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-all duration-300 hover:shadow-sm animate-slide-up-fade-in"
                        style={{animationDelay: `${index * 0.05}s`}}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customer_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer_phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {order.delivery_address || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.branch?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.rider?.name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-all duration-300 ${getStatusColor(order.status)}`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || filtering}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                        currentPage === 1 || filtering
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:scale-105 active:scale-95'
                      }`}
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            disabled={filtering}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white shadow-md'
                                : filtering
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:scale-110 active:scale-95'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || filtering}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                        currentPage === totalPages || filtering
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:scale-105 active:scale-95'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
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
