import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

const libraries = ['places', 'geocoding'];

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

export default function RiderLocationModal({ rider, onClose }) {
  const [showInfo, setShowInfo] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!rider) return null;

  // Check if rider has location data
  const hasLocation = rider.latest_lat && rider.latest_lng;

  const getRiderMarkerColor = (status) => {
    switch (status) {
      case 'IDLE': return '4CAF50'; // Green
      case 'BUSY': return 'FF9800'; // Orange
      case 'OFFLINE': return '9E9E9E'; // Gray
      default: return '4CAF50';
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {rider.name} - Location
                </h3>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <p className="text-sm text-gray-600 mr-2">{rider.phone}</p>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`tel:${rider.phone}`}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors"
                        title="Call"
                      >
                        <svg className="w-5 h-5 text-white" fill="white" viewBox="0 0 24 24">
                          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                        </svg>
                      </a>
                      <a
                        href={`https://wa.me/${rider.phone.replace(/\+/g, '').replace(/\s/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-green-600 hover:bg-green-700 rounded-full text-white transition-colors"
                        title="WhatsApp"
                      >
                        <svg className="w-5 h-5 text-white" fill="white" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rider.status === 'IDLE' ? 'bg-green-100 text-green-800' :
                      rider.status === 'BUSY' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {rider.status}
                    </span>
                    {rider.battery !== null && rider.battery !== undefined && (
                      <span className="text-xs text-gray-600">
                        Battery: {rider.battery}%
                      </span>
                    )}
                    {rider.last_seen_at && (
                      <span className="text-xs text-gray-600">
                        Last seen: {new Date(rider.last_seen_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Map Content */}
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            {hasLocation ? (
              loadError ? (
                <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-900 font-medium">Failed to Load Google Maps</p>
                    <p className="text-xs text-gray-600">Please check your API key configuration</p>
                  </div>
                </div>
              ) : !isLoaded ? (
                <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                    <p className="text-sm text-gray-600">Loading map...</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-[500px] rounded-lg overflow-hidden border border-gray-300">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={{ lat: rider.latest_lat, lng: rider.latest_lng }}
                    zoom={15}
                    options={{
                      zoomControl: true,
                      streetViewControl: false,
                      mapTypeControl: true,
                      fullscreenControl: true,
                    }}
                  >
                    <Marker
                      position={{ lat: rider.latest_lat, lng: rider.latest_lng }}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        fillColor: `#${getRiderMarkerColor(rider.status)}`,
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2,
                        scale: 15,
                      }}
                      onClick={() => setShowInfo(true)}
                    />

                    {showInfo && (
                      <InfoWindow
                        position={{ lat: rider.latest_lat, lng: rider.latest_lng }}
                        onCloseClick={() => setShowInfo(false)}
                      >
                        <div className="text-sm p-1">
                          <p className="font-semibold">{rider.name}</p>
                          <p className="text-gray-600">Status: {rider.status}</p>
                          {rider.battery !== null && rider.battery !== undefined && (
                            <p className="text-gray-600">Battery: {rider.battery}%</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Lat: {rider.latest_lat.toFixed(6)}, Lng: {rider.latest_lng.toFixed(6)}
                          </p>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                </div>
              )
            ) : (
              <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">No location data available</p>
                  <p className="text-xs text-gray-500">Rider has not shared their location yet</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
