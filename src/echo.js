import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

console.log('Key:', import.meta.env.VITE_REVERB_APP_KEY);
console.log('Host:', import.meta.env.VITE_REVERB_HOST);
console.log('Port:', import.meta.env.VITE_REVERB_PORT);
console.log('Scheme:', import.meta.env.VITE_REVERB_SCHEME);

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/broadcasting/auth`,
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            Accept: 'application/json',
        },
    },
});

// Add connection event listeners for debugging
window.Echo.connector.pusher.connection.bind('connected', () => {
    console.log('WebSocket connected successfully');
});

window.Echo.connector.pusher.connection.bind('error', (err) => {
    console.error('WebSocket connection error:', err);
    console.error('Error details:', JSON.stringify(err, null, 2));
});

window.Echo.connector.pusher.connection.bind('disconnected', () => {
    console.warn('WebSocket disconnected');
});

window.Echo.connector.pusher.connection.bind('failed', () => {
    console.error('WebSocket connection failed permanently');
});

window.Echo.connector.pusher.connection.bind('unavailable', () => {
    console.error('WebSocket unavailable');
});

// Log connection state changes
window.Echo.connector.pusher.connection.bind('state_change', (states) => {
    console.log('WebSocket state changed:', states.previous, '->', states.current);
});

export default window.Echo;
