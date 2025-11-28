import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getOrders, getRiders, assignOrder, reassignOrder, updateOrderStatus, createOrder, createRider, getSettings } from '../services/api';
import Map from '../components/Map';
import RiderCard from '../components/RiderCard';
import RiderLocationModal from '../components/RiderLocationModal';
import OrderCard from '../components/OrderCard';
import CreateOrderModal from '../components/CreateOrderModal';
import AddRiderModal from '../components/AddRiderModal';
import DateTimeHeader from '../components/DateTimeHeader';
import Sidebar from '../components/Sidebar';
import BranchSelector from '../components/BranchSelector';
import Logo, { LogoIcon } from '../components/Logo';
import AlertDialog from '../components/AlertDialog';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { showSuccess, showInfo, showWarning } = useToast();
  const [riders, setRiders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map');
  const [restaurantSettings, setRestaurantSettings] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [needsStatusUpdate, setNeedsStatusUpdate] = useState(false);
  const [needsRiderAssignment, setNeedsRiderAssignment] = useState(false);

  // Modal state
  const [selectedRider, setSelectedRider] = useState(null);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showAddRiderModal, setShowAddRiderModal] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'error' });

  // Load data (orders and riders)
  useEffect(() => {
    loadData();
  }, [selectedBranchId]);

  // Load settings separately (they rarely change, so cache them)
  useEffect(() => {
    loadSettings();
  }, [selectedBranchId]);

  // Setup WebSocket
  useEffect(() => {
    if (!window.Echo) {
      console.error('Echo is not initialized');
      return;
    }

    console.log('Setting up WebSocket connections...');

    // Subscribe to riders channel
    const ridersChannel = window.Echo.channel('riders');

    ridersChannel.listen('.rider.location.updated', (data) => {
      console.log('Rider location updated:', data);
      // Update rider location in the riders list
      setRiders((prev) =>
        prev.map((r) => {
          if (r.id === data.rider_id) {
            return {
              ...r,
              latest_lat: data.lat,
              latest_lng: data.lng,
              battery: data.battery,
              last_seen_at: data.ts,
            };
          }
          return r;
        })
      );

      // Show toast notification for rider location update
      const rider = riders.find(r => r.id === data.rider_id);
      if (rider) {
        showInfo(`${rider.name}'s location updated`, 2000);
      }
    });

    // Subscribe to order channel
    const ordersChannel = window.Echo.channel('orders');

    console.log('Orders channel subscribed:', ordersChannel);

    // Listen for subscription success
    ordersChannel.subscribed(() => {
      console.log('Successfully subscribed to orders channel');
    });

    // Listen for subscription errors
    ordersChannel.error((error) => {
      console.error('Error subscribing to orders channel:', error);
    });

    // Listen for ALL events on this channel (for debugging)
    ordersChannel.listenToAll((eventName, data) => {
      console.log('Received event on orders channel:', eventName, data);
    });

    ordersChannel.listen('.order.status.changed', (data) => {
      console.log('Order status changed:', data);

      // Show toast notification based on status change
      const statusMessages = {
        'ASSIGNED': `Order ${data.order?.code || data.order_id} assigned to rider`,
        'PICKED_UP': `Order ${data.order?.code || data.order_id} picked up`,
        'OUT_FOR_DELIVERY': `Order ${data.order?.code || data.order_id} is out for delivery`,
        'DELIVERED': `Order ${data.order?.code || data.order_id} delivered successfully`,
        'FAILED': `Order ${data.order?.code || data.order_id} failed`,
      };

      const message = statusMessages[data.status] || `Order ${data.order?.code || data.order_id} status changed`;

      if (data.status === 'DELIVERED') {
        showSuccess(message);
      } else if (data.status === 'FAILED') {
        showWarning(message);
      } else {
        showInfo(message);
      }

      // Only reload orders (not riders or settings) to get the updated order details
      loadOrders();

      // If order status changed to DELIVERED/FAILED, reload riders too (rider becomes IDLE)
      if (data.status && ['DELIVERED', 'FAILED'].includes(data.status)) {
        loadRiders();
      }
    });

    console.log('WebSocket connections established');

    // Cleanup on unmounting
    return () => {
      console.log('Cleaning up WebSocket connections...');
      window.Echo.leave('riders');
      window.Echo.leave('orders');
    };
  }, []);

  // Selective data loading functions for optimization
  const loadOrders = async () => {
    try {
      const params = selectedBranchId ? { branch_id: selectedBranchId } : {};
      const ordersRes = await getOrders(params);
      console.log('Orders response:', ordersRes.data);
      setOrders(ordersRes.data.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setAlert({
        isOpen: true,
        title: 'Unable to Load Orders',
        message: 'We are having trouble loading orders. Please try again.',
        type: 'error'
      });
    }
  };

  const loadRiders = async () => {
    try {
      const ridersRes = await getRiders(selectedBranchId);
      console.log('Riders response:', ridersRes.data);
      setRiders(ridersRes.data.data || []);
    } catch (error) {
      console.error('Failed to load riders:', error);
      setAlert({
        isOpen: true,
        title: 'Unable to Load Riders',
        message: 'We are having trouble loading riders. Please try again.',
        type: 'error'
      });
    }
  };

  const loadSettings = async () => {
    try {
      const settingsRes = await getSettings(selectedBranchId);
      console.log('Settings response:', settingsRes.data);
      setRestaurantSettings(settingsRes.data.data || {});
    } catch (error) {
      console.error('Failed to load settings:', error);
      setAlert({
        isOpen: true,
        title: 'Unable to Load Settings',
        message: 'We are having trouble loading settings. Please try again.',
        type: 'error'
      });
    }
  };

  const loadData = async () => {
    try {
      // Load orders and riders in parallel (settings loaded separately)
      const params = selectedBranchId ? { branch_id: selectedBranchId } : {};
      const [ridersRes, ordersRes] = await Promise.all([
        getRiders(selectedBranchId),
        getOrders(params),
      ]);
      console.log('Riders response:', ridersRes.data);
      console.log('Orders response:', ordersRes.data);
      setRiders(ridersRes.data.data || []);
      setOrders(ordersRes.data.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setAlert({
        isOpen: true,
        title: 'Unable to Load Data',
        message: 'We are having trouble loading the dashboard data. Please refresh the page and try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOrder = async (orderId, riderId) => {
    // Find rider info for optimistic update
    const rider = riders.find(r => r.id === riderId);

    // Optimistically update both orders and riders in local state
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, rider_id: riderId, rider, status: 'ASSIGNED' }
        : order
    ));

    setRiders(prev => prev.map(r =>
      r.id === riderId
        ? { ...r, status: 'BUSY' }
        : r
    ));

    try {
      await assignOrder(orderId, riderId);
      // Success - no need to reload, WebSocket will sync if needed
    } catch (error) {
      console.error('Failed to assign order:', error);
      // On error, reload both orders and riders to get correct state
      await Promise.all([loadOrders(), loadRiders()]);
      setAlert({
        isOpen: true,
        title: 'Unable to Assign Order',
        message: 'We encountered an issue while assigning the order to the rider. Please try again.',
        type: 'error'
      });
    }
  };

  const handleReassignOrder = async (orderId, riderId) => {
    // Find the order and the new rider
    const order = orders.find(o => o.id === orderId);
    const oldRiderId = order?.assigned_rider_id;
    const newRider = riders.find(r => r.id === riderId);

    // Optimistically update both orders and riders in local state
    setOrders(prev => prev.map(o =>
      o.id === orderId
        ? { ...o, assigned_rider_id: riderId, rider: newRider, status: 'ASSIGNED' }
        : o
    ));

    setRiders(prev => prev.map(r => {
      // Set new rider to BUSY
      if (r.id === riderId) {
        return { ...r, status: 'BUSY' };
      }
      // Set old rider to IDLE (optimistically, will be corrected by API if they have other orders)
      if (r.id === oldRiderId) {
        return { ...r, status: 'IDLE' };
      }
      return r;
    }));

    try {
      await reassignOrder(orderId, riderId);
      // Success - no need to reload, WebSocket will sync if needed
    } catch (error) {
      console.error('Failed to reassign order:', error);
      // On error, reload both orders and riders to get correct state
      await Promise.all([loadOrders(), loadRiders()]);
      setAlert({
        isOpen: true,
        title: 'Unable to Reassign Order',
        message: 'We encountered an issue while reassigning the order to the rider. Please try again.',
        type: 'error'
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId, status, reason) => {
    // Optimistically update the order status in local state
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, status, updated_at: new Date().toISOString() }
        : order
    ));

    try {
      await updateOrderStatus(orderId, status, reason);
      // Success - WebSocket will handle syncing if needed
      // Only reload riders if order is completed (frees up the rider)
      if (['DELIVERED', 'FAILED'].includes(status)) {
        await loadRiders();
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      // On error, reload orders to get the correct state
      await loadOrders();
      setAlert({
        isOpen: true,
        title: 'Unable to Update Status',
        message: 'We encountered an issue while updating the order status. Please try again.',
        type: 'error'
      });
    }
  };

  const handleShowRiderLocation = (rider) => {
    setSelectedRider(rider);
  };

  const handleCloseModal = () => {
    setSelectedRider(null);
  };

  const handleCreateOrder = async (orderData) => {
    try {
      await createOrder(orderData);
      // Only reload orders, not riders or settings
      await loadOrders();
    } catch (error) {
      throw error; // Let the modal handle the error display
    }
  };

  const handleCreateRider = async (riderData) => {
    try {
      await createRider(riderData);
      // Only reload riders, not orders or settings
      await loadRiders();
    } catch (error) {
      throw error; // Let the modal handle the error display
    }
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
          <p className="mt-4 text-gray-600 font-medium">Loading Delivery Dashboard...</p>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter(
    (o) => !['DELIVERED', 'FAILED'].includes(o.status)
  );

  // Filter orders based on selected filters
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }

    // Needs status update filter (orders that are ASSIGNED, PICKED_UP, or OUT_FOR_DELIVERY)
    if (needsStatusUpdate && !['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(order.status)) {
      return false;
    }

    // Needs rider assignment filter (UNASSIGNED orders)
    return ! (needsRiderAssignment && order.status !== 'UNASSIGNED');


  });

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-60">
        <header className="bg-white shadow-md">
        <div className="px-4 sm:px-6 py-3 flex justify-between items-center ml-14 lg:ml-0">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-shrink">
            <Logo className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" textClassName="text-lg sm:text-xl" />
            <div className="hidden sm:block border-l border-gray-300 h-8 mx-2"></div>
            <div className="min-w-0 flex-shrink">
              <BranchSelector
                selectedBranchId={selectedBranchId}
                onBranchChange={setSelectedBranchId}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
            <button
              onClick={logout}
              className="px-2 sm:px-3 md:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow-md flex-shrink-0"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Date Time Header */}
      <div className="px-4 sm:px-6 pt-4">
        <DateTimeHeader restaurantName={restaurantSettings?.restaurant_name || 'Restaurant'} />
      </div>

      {/* Stats */}
      <div className="px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Active Orders</p>
            <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Idle Riders</p>
            <p className="text-2xl font-bold text-green-600">
              {riders.filter((r) => r.status === 'IDLE').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Busy Riders</p>
            <p className="text-2xl font-bold text-yellow-600">
              {riders.filter((r) => r.status === 'BUSY').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Riders</p>
            <p className="text-2xl font-bold text-gray-900">{riders.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-6">
        <div className="border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto w-full sm:w-auto">
            {['map', 'orders', 'riders'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
          <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto pb-2 sm:pb-0">
            <button
              onClick={() => setShowAddRiderModal(true)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-1 sm:space-x-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add Rider</span>
              <span className="sm:hidden">Rider</span>
            </button>
            <button
              onClick={() => setShowCreateOrderModal(true)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-1 sm:space-x-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Create Order</span>
              <span className="sm:hidden">Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-4">
        {activeTab === 'map' && (
          <div key="map-tab" className="bg-white rounded-lg shadow overflow-hidden animate-fade-in">
            <Map riders={riders} orders={activeOrders} />
          </div>
        )}

        {activeTab === 'orders' && (
          <div key="orders-tab" className="space-y-4 animate-fade-in">
            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                {/* Quick Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Filters
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={needsStatusUpdate}
                        onChange={(e) => setNeedsStatusUpdate(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Needs Status Update
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={needsRiderAssignment}
                        onChange={(e) => setNeedsRiderAssignment(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Needs Rider Assignment
                      </span>
                    </label>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setNeedsStatusUpdate(false);
                      setNeedsRiderAssignment(false);
                    }}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>

              {/* Filter Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredOrders.length}</span> of{' '}
                  <span className="font-semibold">{orders.length}</span> orders
                </p>
              </div>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {filteredOrders.length === 0 ? (
                <p className="text-gray-600 col-span-full text-center py-8">
                  No orders found matching the selected filters
                </p>
              ) : (
                filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    riders={riders}
                    onAssign={handleAssignOrder}
                    onReassign={handleReassignOrder}
                    onUpdateStatus={handleUpdateOrderStatus}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'riders' && (
          <div key="riders-tab" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch animate-fade-in">
            {riders.length === 0 ? (
              <p className="text-gray-600 col-span-full text-center py-8">
                No riders found
              </p>
            ) : (
              riders.map((rider) => (
                <RiderCard
                  key={rider.id}
                  rider={rider}
                  onShowLocation={handleShowRiderLocation}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Rider Location Modal */}
      {selectedRider && (
        <RiderLocationModal
          rider={selectedRider}
          onClose={handleCloseModal}
        />
      )}

      {/* Create Order Modal */}
      {showCreateOrderModal && (
        <CreateOrderModal
          onClose={() => setShowCreateOrderModal(false)}
          onCreateOrder={handleCreateOrder}
        />
      )}

      {/* Add Rider Modal */}
      {showAddRiderModal && (
        <AddRiderModal
          onClose={() => setShowAddRiderModal(false)}
          onCreateRider={handleCreateRider}
        />
      )}

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
      </div>
    </div>
  );
}
