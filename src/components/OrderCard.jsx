import { useState } from 'react';

export default function OrderCard({ order, riders = [], onAssign, onUpdateStatus }) {
  const [selectedRider, setSelectedRider] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reason, setReason] = useState('');
  const [showAssign, setShowAssign] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const statusColors = {
    UNASSIGNED: 'bg-gray-100 text-gray-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    PICKED_UP: 'bg-indigo-100 text-indigo-800',
    OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
  };

  const availableStatuses = {
    ASSIGNED: ['PICKED_UP', 'FAILED'],
    PICKED_UP: ['OUT_FOR_DELIVERY', 'FAILED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
  };

  const handleAssign = async () => {
    if (!selectedRider) return;
    await onAssign(order.id, parseInt(selectedRider));
    setShowAssign(false);
    setSelectedRider('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;
    await onUpdateStatus(order.id, selectedStatus, reason || null);
    setShowStatus(false);
    setSelectedStatus('');
    setReason('');
  };

  // Filter riders: idle and from same branch as the order
  const idleRiders = riders.filter((r) => {
    if (r.status !== 'IDLE') return false;
    // If order has branch_id, only show riders from the same branch
    if (order.branch_id && r.branch_id && order.branch_id !== r.branch_id) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">{order.code}</h3>
            <p className="text-sm text-gray-700">{order.customer_name}</p>
            {order.customer_phone && (
              <p className="text-sm text-gray-600">{order.customer_phone}</p>
            )}
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[order.status] || statusColors.UNASSIGNED
            }`}
          >
            {order.status}
          </span>
        </div>

        {order.address && <p className="text-sm text-gray-600 mb-2">{order.address}</p>}

        {order.branch && (
          <p className="text-xs text-gray-500 mb-1">
            <span className="inline-flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {order.branch.name}
            </span>
          </p>
        )}

        {order.assigned_rider_id && order.rider && (
          <p className="text-sm text-gray-600 mb-2">
            Rider: <span className="font-medium">{order.rider.name}</span>
          </p>
        )}
      </div>

      <div className="mt-3 space-y-2 pt-3 border-t border-gray-200">
        {order.status === 'UNASSIGNED' && (
          <>
            {!showAssign ? (
              <button
                onClick={() => setShowAssign(true)}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Assign Rider
              </button>
            ) : (
              <div className="space-y-2">
                <select
                  value={selectedRider}
                  onChange={(e) => setSelectedRider(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a rider</option>
                  {idleRiders.map((rider) => (
                    <option key={rider.id} value={rider.id}>
                      {rider.name}
                    </option>
                  ))}
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAssign}
                    disabled={!selectedRider}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => {
                      setShowAssign(false);
                      setSelectedRider('');
                    }}
                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {availableStatuses[order.status] && (
          <>
            {!showStatus ? (
              <button
                onClick={() => setShowStatus(true)}
                className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Update Status
              </button>
            ) : (
              <div className="space-y-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select status</option>
                  {availableStatuses[order.status].map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>

                {selectedStatus === 'FAILED' && (
                  <input
                    type="text"
                    placeholder="Reason for failure"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateStatus}
                    disabled={!selectedStatus}
                    className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => {
                      setShowStatus(false);
                      setSelectedStatus('');
                      setReason('');
                    }}
                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
