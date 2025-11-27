export default function RiderCard({ rider, onShowLocation }) {
  const statusColors = {
    IDLE: 'bg-green-100 text-green-800',
    BUSY: 'bg-yellow-100 text-yellow-800',
    OFFLINE: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">{rider.name}</h3>
            <p className="text-sm text-gray-600">{rider.phone}</p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[rider.status] || statusColors.OFFLINE
            }`}
          >
            {rider.status}
          </span>
        </div>

        {rider.branch && (
          <p className="text-sm text-gray-600 mb-2">
            <span className="inline-flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {rider.branch.name}
            </span>
          </p>
        )}

        <div className="text-sm text-gray-600 space-y-1 mb-3">
          {rider.battery !== null && rider.battery !== undefined && (
            <p>Battery: {rider.battery}%</p>
          )}
          {rider.last_seen_at && (
            <p className="text-xs">
              Last seen: {new Date(rider.last_seen_at).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => onShowLocation(rider)}
        className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Show on Map</span>
      </button>
    </div>
  );
}
