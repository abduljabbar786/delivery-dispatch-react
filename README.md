# Delivery Dispatch - Frontend (Supervisor Dashboard)

React SPA for supervisors to manage delivery orders and riders in real-time.

## Tech Stack

- **React 18** with Vite
- **React Router** for routing
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Leaflet + React Leaflet** for map visualization
- **Pusher JS** for real-time WebSocket updates

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your backend API URL and Pusher credentials:
   ```
   VITE_API_URL=http://localhost:8000/api
   VITE_PUSHER_KEY=local-key
   VITE_PUSHER_HOST=localhost
   VITE_PUSHER_PORT=6001
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Features

### Dashboard
- Real-time map showing rider locations and order destinations
- Live stats: active orders, idle/busy riders
- Tabbed interface: Map, Orders, Riders

### Order Management
- View all orders with status badges
- Assign unassigned orders to idle riders
- Update order status through workflow:
  - UNASSIGNED → ASSIGNED → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
  - Mark as FAILED at any stage with reason

### Rider Monitoring
- View all riders with status (IDLE/BUSY/OFFLINE)
- See battery level and last seen timestamp
- Real-time location updates on map

### Real-time Updates
- WebSocket integration via Pusher/Soketi
- Live updates for order status changes
- Live updates for rider location and status

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Map.jsx        # Leaflet map with markers
│   ├── RiderCard.jsx  # Rider display card
│   └── OrderCard.jsx  # Order display card with actions
├── contexts/          # React contexts
│   └── AuthContext.jsx # Authentication state
├── pages/             # Page components
│   ├── Login.jsx      # Login page
│   └── Dashboard.jsx  # Main dashboard
├── services/          # API and external services
│   └── api.js         # Axios API client
├── App.jsx            # Main app with routing
└── main.jsx           # Entry point
```

## Default Credentials

Use the seeded supervisor account:
- Email: `supervisor@example.com`
- Password: `password`

## API Integration

The frontend expects the following API endpoints:

- `POST /api/login` - Authentication
- `GET /api/orders` - Fetch all orders
- `POST /api/orders/:id/assign` - Assign order to rider
- `POST /api/orders/:id/status` - Update order status
- `GET /api/riders` - Fetch all riders
- `GET /api/map/riders` - Get rider positions

## WebSocket Events

Subscribes to:
- `riders` channel → `rider.updated` event
- `orders` channel → `order.updated` event
