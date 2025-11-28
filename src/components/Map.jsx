import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useState } from 'react';

const libraries = ['places', 'geocoding'];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '500px',
  maxWidth: '100%',
};

// Default center: Lahore, Pakistan
const defaultCenter = {
  lat: 31.5204,
  lng: 74.3587,
};

// Create SVG icon for bike with color
const createBikeIcon = (color) => {
  const svg = `
    <svg fill="${color}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
         width="32" height="32" viewBox="0 0 467.168 467.168"
         xml:space="preserve">
    <g>
        <g>
            <path d="M76.849,210.531C34.406,210.531,0,244.937,0,287.388c0,42.438,34.406,76.847,76.849,76.847
                c30.989,0,57.635-18.387,69.789-44.819l18.258,14.078c0,0,134.168,0.958,141.538-3.206c0,0-16.65-45.469,4.484-64.688
                c2.225-2.024,5.021-4.332,8.096-6.777c-3.543,8.829-5.534,18.45-5.534,28.558c0,42.446,34.403,76.846,76.846,76.846
                c42.443,0,76.843-34.415,76.843-76.846c0-42.451-34.408-76.849-76.843-76.849c-0.697,0-1.362,0.088-2.056,0.102
                c5.551-3.603,9.093-5.865,9.093-5.865l-5.763-5.127c0,0,16.651-3.837,12.816-12.167c-3.848-8.33-44.19-58.28-44.19-58.28
                s7.146-15.373-7.634-26.261l-7.098,15.371c0,0-18.093-12.489-25.295-10.084c-7.205,2.398-18.005,3.603-21.379,8.884l-3.358,3.124
                c0,0-0.95,5.528,4.561,13.693c0,0,55.482,17.05,58.119,29.537c0,0,3.848,7.933-12.728,9.844l-3.354,4.328l-8.896,0.479
                l-16.082-36.748c0,0-15.381,4.082-23.299,10.323l1.201,6.24c0,0-64.599-43.943-125.362,21.137c0,0-44.909,12.966-76.37-26.897
                c0,0-0.479-12.968-76.367-10.565l5.286,5.524c0,0-5.286,0.479-7.444,3.841c-2.158,3.358,1.2,6.961,18.494,6.961
                c0,0,39.153,44.668,69.17,42.032l42.743,20.656l18.975,32.42c0,0,0.034,2.785,0.23,7.045c-4.404,0.938-9.341,1.979-14.579,3.09
                C139.605,232.602,110.832,210.531,76.849,210.531z M390.325,234.081c29.395,0,53.299,23.912,53.299,53.299
                c0,29.39-23.912,53.294-53.299,53.294c-29.394,0-53.294-23.912-53.294-53.294C337.031,257.993,360.932,234.081,390.325,234.081z
                 M76.849,340.683c-29.387,0-53.299-23.913-53.299-53.295c0-29.395,23.912-53.299,53.299-53.299
                c22.592,0,41.896,14.154,49.636,34.039c-28.26,6.011-56.31,11.99-56.31,11.99l3.619,19.933l55.339-2.444
                C124.365,322.116,102.745,340.683,76.849,340.683z M169.152,295.835c1.571,5.334,3.619,9.574,6.312,11.394l-24.696,0.966
                c1.058-3.783,1.857-7.666,2.338-11.662L169.152,295.835z"/>
        </g>
    </g>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// Create simple red circle/dot for order locations
const createRedDot = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" fill="#DC2626" stroke="#FFFFFF" stroke-width="2"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// Get rider marker icon based on status
const getRiderIcon = (status) => {
  let color;
  switch (status) {
    case 'IDLE':
      color = '#4CAF50'; // Green
      break;
    case 'BUSY':
      color = '#FF9800'; // Orange
      break;
    case 'OFFLINE':
      color = '#9E9E9E'; // Gray
      break;
    default:
      color = '#4CAF50';
  }

  return {
    url: createBikeIcon(color),
    scaledSize: new window.google.maps.Size(32, 32),
    anchor: new window.google.maps.Point(16, 16),
  };
};

// Get order marker icon (red dot)
const getOrderIcon = () => ({
  url: createRedDot(),
  scaledSize: new window.google.maps.Size(24, 24),
  anchor: new window.google.maps.Point(12, 12),
});

export default function Map({ riders = [], orders = [], center = [31.5204, 74.3587], zoom = 12 }) {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  if (loadError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Google Maps</p>
          <p className="text-sm text-gray-600">Please check your Google Maps API key configuration.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  const mapCenter = center ? { lat: center[0], lng: center[1] } : defaultCenter;

  return (
    <div className="relative h-full w-full max-w-full overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        onLoad={setMapInstance}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
      >
        {/* Rider markers */}
        {riders.map((rider) => (
          rider.latest_lat && rider.latest_lng && (
            <Marker
              key={`rider-${rider.id}`}
              position={{ lat: rider.latest_lat, lng: rider.latest_lng }}
              icon={getRiderIcon(rider.status)}
              onClick={() => setSelectedMarker({ type: 'rider', data: rider })}
            />
          )
        ))}

        {/* Order markers */}
        {orders.map((order) => (
          order.lat && order.lng && (
            <Marker
              key={`order-${order.id}`}
              position={{ lat: order.lat, lng: order.lng }}
              icon={getOrderIcon()}
              onClick={() => setSelectedMarker({ type: 'order', data: order })}
            />
          )
        ))}

        {/* Info Window for selected marker */}
        {selectedMarker && selectedMarker.type === 'rider' && (
          <InfoWindow
            position={{
              lat: selectedMarker.data.latest_lat,
              lng: selectedMarker.data.latest_lng,
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="text-sm min-w-[200px] p-2">
              <p className="font-semibold text-base mb-2">{selectedMarker.data.name}</p>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-gray-600 text-xs">
                    <span className="font-medium">Phone:</span> {selectedMarker.data.phone}
                  </p>
                  <div className="flex items-center space-x-1">
                    <a
                      href={`tel:${selectedMarker.data.phone}`}
                      className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-all duration-200 hover:scale-110 active:scale-95"
                      title="Call"
                    >
                      <svg className="w-3 h-3 text-white" fill="white" viewBox="0 0 24 24">
                        <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                      </svg>
                    </a>
                    <a
                      href={`https://wa.me/${selectedMarker.data.phone.replace(/\+/g, '').replace(/\s/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-green-600 hover:bg-green-700 rounded-full text-white transition-all duration-200 hover:scale-110 active:scale-95"
                      title="WhatsApp"
                    >
                      <svg className="w-3 h-3 text-white" fill="white" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </a>
                  </div>
                </div>
                <p className="text-gray-600 text-xs">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    selectedMarker.data.status === 'IDLE' ? 'bg-green-100 text-green-800' :
                    selectedMarker.data.status === 'BUSY' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedMarker.data.status}
                  </span>
                </p>
                {selectedMarker.data.battery !== null && selectedMarker.data.battery !== undefined && (
                  <p className="text-gray-600 text-xs">
                    <span className="font-medium">Battery:</span> {selectedMarker.data.battery}%
                  </p>
                )}
                {selectedMarker.data.last_seen_at && (
                  <p className="text-gray-500 text-xs">
                    Last seen: {new Date(selectedMarker.data.last_seen_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </InfoWindow>
        )}

        {selectedMarker && selectedMarker.type === 'order' && (
          <InfoWindow
            position={{
              lat: selectedMarker.data.lat,
              lng: selectedMarker.data.lng,
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="text-sm min-w-[220px] p-2">
              <p className="font-semibold text-base mb-2">{selectedMarker.data.code}</p>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-gray-600 text-xs">
                    <span className="font-medium">Customer:</span> {selectedMarker.data.customer_name}
                  </p>
                  {selectedMarker.data.customer_phone && (
                    <div className="flex items-center space-x-1">
                      <a
                        href={`tel:${selectedMarker.data.customer_phone}`}
                        className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors"
                        title="Call Customer"
                      >
                        <svg className="w-3 h-3 text-white" fill="white" viewBox="0 0 24 24">
                          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                        </svg>
                      </a>
                      <a
                        href={`https://wa.me/${selectedMarker.data.customer_phone.replace(/\+/g, '').replace(/\s/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-green-600 hover:bg-green-700 rounded-full text-white transition-colors"
                        title="WhatsApp Customer"
                      >
                        <svg className="w-3 h-3 text-white" fill="white" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </a>
                    </div>
                  )}
                </div>

                {selectedMarker.data.customer_phone && (
                  <p className="text-gray-600 text-xs">
                    {selectedMarker.data.customer_phone}
                  </p>
                )}

                {selectedMarker.data.address && (
                  <p className="text-gray-600 text-xs">
                    <span className="font-medium">Address:</span> {selectedMarker.data.address}
                  </p>
                )}

                <p className="text-gray-600 text-xs">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    selectedMarker.data.status === 'UNASSIGNED' ? 'bg-gray-100 text-gray-800' :
                    selectedMarker.data.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                    selectedMarker.data.status === 'PICKED_UP' ? 'bg-indigo-100 text-indigo-800' :
                    selectedMarker.data.status === 'OUT_FOR_DELIVERY' ? 'bg-purple-100 text-purple-800' :
                    selectedMarker.data.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedMarker.data.status.replace(/_/g, ' ')}
                  </span>
                </p>

                {selectedMarker.data.assigned_rider_id && selectedMarker.data.rider && (
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <p className="text-gray-600 text-xs mb-1">
                      <span className="font-medium">Assigned Rider:</span>
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-gray-700 font-medium text-xs">{selectedMarker.data.rider.name}</p>
                        <p className="text-gray-500 text-xs">{selectedMarker.data.rider.phone}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <a
                          href={`tel:${selectedMarker.data.rider.phone}`}
                          className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors"
                          title="Call Rider"
                        >
                          <svg className="w-3 h-3 text-white" fill="white" viewBox="0 0 24 24">
                            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                          </svg>
                        </a>
                        <a
                          href={`https://wa.me/${selectedMarker.data.rider.phone.replace(/\+/g, '').replace(/\s/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-green-600 hover:bg-green-700 rounded-full text-white transition-colors"
                          title="WhatsApp Rider"
                        >
                          <svg className="w-3 h-3 text-white" fill="white" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Map Legend */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 bg-white rounded-lg shadow-lg p-2 sm:p-3 md:p-4 z-[1000] border border-gray-200 max-w-[160px] sm:max-w-none">
        <h4 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3 text-gray-900">Legend</h4>
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <svg fill="#4CAF50" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" viewBox="0 0 467.168 467.168" xmlSpace="preserve">
              <g>
                <g>
                  <path d="M76.849,210.531C34.406,210.531,0,244.937,0,287.388c0,42.438,34.406,76.847,76.849,76.847
                    c30.989,0,57.635-18.387,69.789-44.819l18.258,14.078c0,0,134.168,0.958,141.538-3.206c0,0-16.65-45.469,4.484-64.688
                    c2.225-2.024,5.021-4.332,8.096-6.777c-3.543,8.829-5.534,18.45-5.534,28.558c0,42.446,34.403,76.846,76.846,76.846
                    c42.443,0,76.843-34.415,76.843-76.846c0-42.451-34.408-76.849-76.843-76.849c-0.697,0-1.362,0.088-2.056,0.102
                    c5.551-3.603,9.093-5.865,9.093-5.865l-5.763-5.127c0,0,16.651-3.837,12.816-12.167c-3.848-8.33-44.19-58.28-44.19-58.28
                    s7.146-15.373-7.634-26.261l-7.098,15.371c0,0-18.093-12.489-25.295-10.084c-7.205,2.398-18.005,3.603-21.379,8.884l-3.358,3.124
                    c0,0-0.95,5.528,4.561,13.693c0,0,55.482,17.05,58.119,29.537c0,0,3.848,7.933-12.728,9.844l-3.354,4.328l-8.896,0.479
                    l-16.082-36.748c0,0-15.381,4.082-23.299,10.323l1.201,6.24c0,0-64.599-43.943-125.362,21.137c0,0-44.909,12.966-76.37-26.897
                    c0,0-0.479-12.968-76.367-10.565l5.286,5.524c0,0-5.286,0.479-7.444,3.841c-2.158,3.358,1.2,6.961,18.494,6.961
                    c0,0,39.153,44.668,69.17,42.032l42.743,20.656l18.975,32.42c0,0,0.034,2.785,0.23,7.045c-4.404,0.938-9.341,1.979-14.579,3.09
                    C139.605,232.602,110.832,210.531,76.849,210.531z M390.325,234.081c29.395,0,53.299,23.912,53.299,53.299
                    c0,29.39-23.912,53.294-53.299,53.294c-29.394,0-53.294-23.912-53.294-53.294C337.031,257.993,360.932,234.081,390.325,234.081z
                     M76.849,340.683c-29.387,0-53.299-23.913-53.299-53.295c0-29.395,23.912-53.299,53.299-53.299
                    c22.592,0,41.896,14.154,49.636,34.039c-28.26,6.011-56.31,11.99-56.31,11.99l3.619,19.933l55.339-2.444
                    C124.365,322.116,102.745,340.683,76.849,340.683z M169.152,295.835c1.571,5.334,3.619,9.574,6.312,11.394l-24.696,0.966
                    c1.058-3.783,1.857-7.666,2.338-11.662L169.152,295.835z"/>
                </g>
              </g>
            </svg>
            <span className="text-[10px] sm:text-xs text-gray-700">Idle Rider</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <svg fill="#FF9800" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" viewBox="0 0 467.168 467.168" xmlSpace="preserve">
              <g>
                <g>
                  <path d="M76.849,210.531C34.406,210.531,0,244.937,0,287.388c0,42.438,34.406,76.847,76.849,76.847
                    c30.989,0,57.635-18.387,69.789-44.819l18.258,14.078c0,0,134.168,0.958,141.538-3.206c0,0-16.65-45.469,4.484-64.688
                    c2.225-2.024,5.021-4.332,8.096-6.777c-3.543,8.829-5.534,18.45-5.534,28.558c0,42.446,34.403,76.846,76.846,76.846
                    c42.443,0,76.843-34.415,76.843-76.846c0-42.451-34.408-76.849-76.843-76.849c-0.697,0-1.362,0.088-2.056,0.102
                    c5.551-3.603,9.093-5.865,9.093-5.865l-5.763-5.127c0,0,16.651-3.837,12.816-12.167c-3.848-8.33-44.19-58.28-44.19-58.28
                    s7.146-15.373-7.634-26.261l-7.098,15.371c0,0-18.093-12.489-25.295-10.084c-7.205,2.398-18.005,3.603-21.379,8.884l-3.358,3.124
                    c0,0-0.95,5.528,4.561,13.693c0,0,55.482,17.05,58.119,29.537c0,0,3.848,7.933-12.728,9.844l-3.354,4.328l-8.896,0.479
                    l-16.082-36.748c0,0-15.381,4.082-23.299,10.323l1.201,6.24c0,0-64.599-43.943-125.362,21.137c0,0-44.909,12.966-76.37-26.897
                    c0,0-0.479-12.968-76.367-10.565l5.286,5.524c0,0-5.286,0.479-7.444,3.841c-2.158,3.358,1.2,6.961,18.494,6.961
                    c0,0,39.153,44.668,69.17,42.032l42.743,20.656l18.975,32.42c0,0,0.034,2.785,0.23,7.045c-4.404,0.938-9.341,1.979-14.579,3.09
                    C139.605,232.602,110.832,210.531,76.849,210.531z M390.325,234.081c29.395,0,53.299,23.912,53.299,53.299
                    c0,29.39-23.912,53.294-53.299,53.294c-29.394,0-53.294-23.912-53.294-53.294C337.031,257.993,360.932,234.081,390.325,234.081z
                     M76.849,340.683c-29.387,0-53.299-23.913-53.299-53.295c0-29.395,23.912-53.299,53.299-53.299
                    c22.592,0,41.896,14.154,49.636,34.039c-28.26,6.011-56.31,11.99-56.31,11.99l3.619,19.933l55.339-2.444
                    C124.365,322.116,102.745,340.683,76.849,340.683z M169.152,295.835c1.571,5.334,3.619,9.574,6.312,11.394l-24.696,0.966
                    c1.058-3.783,1.857-7.666,2.338-11.662L169.152,295.835z"/>
                </g>
              </g>
            </svg>
            <span className="text-[10px] sm:text-xs text-gray-700">Busy Rider</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <svg fill="#9E9E9E" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" viewBox="0 0 467.168 467.168" xmlSpace="preserve">
              <g>
                <g>
                  <path d="M76.849,210.531C34.406,210.531,0,244.937,0,287.388c0,42.438,34.406,76.847,76.849,76.847
                    c30.989,0,57.635-18.387,69.789-44.819l18.258,14.078c0,0,134.168,0.958,141.538-3.206c0,0-16.65-45.469,4.484-64.688
                    c2.225-2.024,5.021-4.332,8.096-6.777c-3.543,8.829-5.534,18.45-5.534,28.558c0,42.446,34.403,76.846,76.846,76.846
                    c42.443,0,76.843-34.415,76.843-76.846c0-42.451-34.408-76.849-76.843-76.849c-0.697,0-1.362,0.088-2.056,0.102
                    c5.551-3.603,9.093-5.865,9.093-5.865l-5.763-5.127c0,0,16.651-3.837,12.816-12.167c-3.848-8.33-44.19-58.28-44.19-58.28
                    s7.146-15.373-7.634-26.261l-7.098,15.371c0,0-18.093-12.489-25.295-10.084c-7.205,2.398-18.005,3.603-21.379,8.884l-3.358,3.124
                    c0,0-0.95,5.528,4.561,13.693c0,0,55.482,17.05,58.119,29.537c0,0,3.848,7.933-12.728,9.844l-3.354,4.328l-8.896,0.479
                    l-16.082-36.748c0,0-15.381,4.082-23.299,10.323l1.201,6.24c0,0-64.599-43.943-125.362,21.137c0,0-44.909,12.966-76.37-26.897
                    c0,0-0.479-12.968-76.367-10.565l5.286,5.524c0,0-5.286,0.479-7.444,3.841c-2.158,3.358,1.2,6.961,18.494,6.961
                    c0,0,39.153,44.668,69.17,42.032l42.743,20.656l18.975,32.42c0,0,0.034,2.785,0.23,7.045c-4.404,0.938-9.341,1.979-14.579,3.09
                    C139.605,232.602,110.832,210.531,76.849,210.531z M390.325,234.081c29.395,0,53.299,23.912,53.299,53.299
                    c0,29.39-23.912,53.294-53.299,53.294c-29.394,0-53.294-23.912-53.294-53.294C337.031,257.993,360.932,234.081,390.325,234.081z
                     M76.849,340.683c-29.387,0-53.299-23.913-53.299-53.295c0-29.395,23.912-53.299,53.299-53.299
                    c22.592,0,41.896,14.154,49.636,34.039c-28.26,6.011-56.31,11.99-56.31,11.99l3.619,19.933l55.339-2.444
                    C124.365,322.116,102.745,340.683,76.849,340.683z M169.152,295.835c1.571,5.334,3.619,9.574,6.312,11.394l-24.696,0.966
                    c1.058-3.783,1.857-7.666,2.338-11.662L169.152,295.835z"/>
                </g>
              </g>
            </svg>
            <span className="text-[10px] sm:text-xs text-gray-700">Offline Rider</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2"/>
            </svg>
            <span className="text-[10px] sm:text-xs text-gray-700">Order</span>
          </div>
        </div>
      </div>
    </div>
  );
}
