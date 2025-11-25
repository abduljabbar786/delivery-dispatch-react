import { useState, useEffect } from 'react';

export default function DateTimeHeader({ restaurantName = 'Restaurant' }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDay = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Restaurant Name */}
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1 drop-shadow-md">
            {restaurantName}
          </h1>
          <div className="flex items-center space-x-2 text-blue-100">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Delivery Dispatch Dashboard</span>
          </div>
        </div>

        {/* Date and Time Display */}
        <div className="flex flex-col items-start md:items-end space-y-2">
          {/* Day of Week */}
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
            <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="text-lg font-semibold">{formatDay(currentTime)}</span>
          </div>

          {/* Date */}
          <div className="flex items-center space-x-2 text-blue-50">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="text-base font-medium">{formatDate(currentTime)}</span>
          </div>

          {/* Time */}
          <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-lg border border-white/30 shadow-xl">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-green-300 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-2xl md:text-3xl font-bold tracking-wider font-mono tabular-nums">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-lg pointer-events-none">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}
