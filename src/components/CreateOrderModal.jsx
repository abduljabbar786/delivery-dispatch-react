import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { getBranches } from '../services/api';
import AlertDialog from './AlertDialog';

const libraries = ['places', 'geocoding'];

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

// Default center: Lahore, Pakistan
const defaultCenter = {
  lat: 31.601132308693916,
  lng: 74.33857608321304,
};

// Lahore bounds for restricting autocomplete
const lahoreBounds = {
  north: 31.8,
  south: 31.3,
  east: 74.6,
  west: 74.1,
};

export default function CreateOrderModal({ onClose, onCreateOrder }) {
  const [formData, setFormData] = useState({
    code: '',
    branch_id: '',
    customer_name: '',
    customer_phone: '',
    address: '',
    lat: '',
    lng: '',
    notes: '',
  });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [map, setMap] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const addressDropdownRef = useRef(null);
  const [alert, setAlert] = useState({ isOpen: false, title: '', message: '', type: 'error' });
  const [validationErrors, setValidationErrors] = useState({});

  const { isLoaded: googleMapsLoaded, loadError: googleMapsError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Load branches on mount
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const response = await getBranches();
        const activeBranches = response.data.filter(b => b.is_active);
        setBranches(activeBranches);
        // Auto-select first branch if only one exists
        if (activeBranches.length === 1) {
          setFormData(prev => ({ ...prev, branch_id: activeBranches[0].id }));
        }
      } catch (error) {
        console.error('Failed to load branches:', error);
      }
    };
    loadBranches();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addressDropdownRef.current && !addressDropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce timer for address search
  useEffect(() => {
    if (formData.address.trim().length > 2 && googleMapsLoaded) {
      const timer = setTimeout(() => {
        searchAddressSuggestions(formData.address);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setAddressSuggestions([]);
    }
  }, [formData.address, googleMapsLoaded]);

  const onGoogleMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onGoogleMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setMarkerPosition({ lat, lng });
    setFormData((prev) => ({
      ...prev,
      lat,
      lng,
    }));

    // Reverse geocode to get address
    reverseGeocode(lat, lng);
  }, []);

  const reverseGeocode = async (lat, lng) => {
    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      try {
        const result = await geocoder.geocode({ location: { lat, lng } });
        if (result.results[0]) {
          setFormData((prev) => ({
            ...prev,
            address: result.results[0].formatted_address,
          }));
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
      }
    }
  };

  // Search for address suggestions
  const searchAddressSuggestions = async (query) => {
    if (!query || query.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setSearchingAddress(true);
    try {
      if (window.google) {
        const request = {
          input: query,
          includedRegionCodes: ['pk'],
          locationRestriction: {
            north: lahoreBounds.north,
            south: lahoreBounds.south,
            east: lahoreBounds.east,
            west: lahoreBounds.west,
          },
        };

        const { suggestions } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

        if (suggestions && suggestions.length > 0) {
          const formattedSuggestions = suggestions.map(suggestion => ({
            place_id: suggestion.placePrediction.placeId,
            description: suggestion.placePrediction.text.toString(),
          }));
          setAddressSuggestions(formattedSuggestions);
        } else {
          setAddressSuggestions([]);
        }
      }
    } catch (error) {
      console.error('Address search error:', error);
      setAddressSuggestions([]);
    } finally {
      setSearchingAddress(false);
    }
  };

  const handleSelectSuggestion = async (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      address: suggestion.description,
    }));

    // Geocode the selected place
    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      try {
        const result = await geocoder.geocode({ placeId: suggestion.place_id });
        if (result.results[0]) {
          const location = result.results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          setFormData((prev) => ({
            ...prev,
            lat,
            lng,
          }));
          setMarkerPosition({ lat, lng });
          setMapCenter({ lat, lng });

          if (map) {
            map.panTo({ lat, lng });
          }
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }

    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation errors when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    // Show suggestions when typing in address field
    if (name === 'address') {
      if (value.trim().length > 2) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
        setAddressSuggestions([]);
      }
    }
  };

  // Geocode address
  const handleGeocodeAddress = async () => {
    if (!formData.address.trim()) {
      setValidationErrors({ address: 'Please enter an address first' });
      return;
    }

    setValidationErrors({});
    setGeocoding(true);

    try {
      if (window.google) {
        const geocoder = new window.google.maps.Geocoder();
        const result = await geocoder.geocode({
          address: formData.address,
          componentRestrictions: { country: 'pk' },
          locationBias: {
            north: lahoreBounds.north,
            south: lahoreBounds.south,
            east: lahoreBounds.east,
            west: lahoreBounds.west,
          },
        });

        if (result.results[0]) {
          const location = result.results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          setFormData((prev) => ({
            ...prev,
            lat,
            lng,
          }));
          setMarkerPosition({ lat, lng });
          setMapCenter({ lat, lng });

          if (map) {
            map.panTo({ lat, lng });
          }
        } else {
          setValidationErrors({ address: 'Address not found. Please try a different address or select location on the map.' });
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setAlert({
        isOpen: true,
        title: 'Location Lookup Failed',
        message: 'We encountered an issue while looking up the address. Please try selecting the location on the map instead.',
        type: 'error'
      });
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    const errors = {};
    if (!formData.branch_id) {
      errors.branch_id = 'Please select a branch';
    }
    if (!formData.lat || !formData.lng) {
      errors.address = 'Please select a delivery location on the map or geocode an address';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);

    try {
      // Filter out empty fields
      const orderData = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== '') {
          orderData[key] = formData[key];
        }
      });

      await onCreateOrder(orderData);
      onClose();
    } catch (error) {
      console.error('Failed to create order:', error);
      setAlert({
        isOpen: true,
        title: 'Unable to Create Order',
        message: error.response?.data?.message || 'We encountered an issue while creating the order. Please check the information and try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (googleMapsError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Google Maps</p>
            <p className="text-sm text-gray-600 mb-4">Please check your Google Maps API key configuration.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!googleMapsLoaded) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-semibold text-white">Create New Order</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Order Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Code
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., ORD-12345"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">Optional unique identifier for this order</p>
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
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                validationErrors.branch_id
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              required
            >
              <option value="">Select a branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            {validationErrors.branch_id && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.branch_id}</p>
            )}
          </div>

          {/* Customer Information */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Customer Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Phone
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  placeholder="e.g., +92 300 1234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Delivery Address</h3>

            {/* Address */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative" ref={addressDropdownRef}>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g., House 123, Street 45, DHA Phase 5, Lahore"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                      validationErrors.address
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />

                  {/* Address Suggestions Dropdown */}
                  {showSuggestions && (
                    <div className="absolute z-[1000] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {searchingAddress ? (
                        <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Searching...
                        </div>
                      ) : addressSuggestions.length > 0 ? (
                        <ul className="py-1">
                          {addressSuggestions.map((suggestion, index) => (
                            <li
                              key={suggestion.place_id || index}
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-start gap-2">
                                <svg className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-gray-700">{suggestion.description}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No suggestions found
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleGeocodeAddress}
                  disabled={geocoding || !formData.address.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-md hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed h-fit"
                  title="Get coordinates from address"
                >
                  {geocoding ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {validationErrors.address ? (
                <p className="mt-1 text-xs text-red-600">
                  {validationErrors.address}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Start typing to see address suggestions, or click the location icon to geocode
                </p>
              )}
            </div>

            {/* Map */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Location on Map
              </label>
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={13}
                  onClick={onGoogleMapClick}
                  onLoad={onGoogleMapLoad}
                  options={{
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                  }}
                >
                  {markerPosition && <Marker position={markerPosition} />}
                </GoogleMap>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Click anywhere on the map to set the delivery location
              </p>
            </div>

            {/* Coordinates Display */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  name="lat"
                  value={formData.lat}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none"
                  placeholder="Click on map"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  name="lng"
                  value={formData.lng}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none"
                  placeholder="Click on map"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g., Ring doorbell twice, Call before delivery, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">Optional special instructions for the rider</p>
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
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Order'}
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
