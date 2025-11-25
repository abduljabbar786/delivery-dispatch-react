# Frontend Setup Notes

## PostCSS & Vite Issues - RESOLVED ✅

### Problem
The initial setup used Tailwind CSS v4 (alpha/beta), which has different configuration requirements and is not production-ready.

### Solution Applied
Downgraded to **Tailwind CSS v3.4.18** (stable, production-ready version).

### Changes Made

1. **Removed Tailwind v4**:
   ```bash
   npm uninstall tailwindcss
   ```

2. **Installed Tailwind v3 with compatible versions**:
   ```bash
   npm install -D tailwindcss@^3.4.1 postcss@^8.4.35 autoprefixer@^10.4.18
   ```

3. **Configuration Files** (already in place):
   - `postcss.config.js` - PostCSS configuration
   - `tailwind.config.js` - Tailwind configuration
   - `src/index.css` - Tailwind directives

### Verification

✅ **Build Test Passed**:
```bash
npm run build
# Output: Successfully built with Tailwind CSS included (29.78 kB)
```

✅ **Dev Server Works**:
```bash
npm run dev
# Server starts on http://localhost:5173 (or next available port)
```

## Current Configuration

### package.json Dependencies
```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.18",
    "postcss": "^8.5.6",
    "autoprefixer": "^10.4.22",
    "vite": "^7.2.2"
  }
}
```

### postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### tailwind.config.js
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Running the Frontend

### Development
```bash
cd frontend
npm install  # if not already done
npm run dev
```

### Production Build
```bash
npm run build
npm run preview  # Preview production build locally
```

## Known Issues & Solutions

### Issue: Port already in use
**Solution**: Vite automatically tries the next available port (5174, 5175, etc.)

### Issue: CSS not loading
**Solution**:
1. Ensure `src/index.css` is imported in `src/main.jsx`
2. Clear browser cache
3. Delete `node_modules/.vite` and restart dev server

### Issue: Tailwind classes not applying
**Solution**:
1. Verify `tailwind.config.js` content paths include your files
2. Check that `@tailwind` directives are in `src/index.css`
3. Restart dev server after config changes

## Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:8000/api
VITE_PUSHER_KEY=local-key
VITE_PUSHER_HOST=localhost
VITE_PUSHER_PORT=6001
```

## Next Steps

1. Ensure backend is running on http://localhost:8000
2. Start Soketi for WebSockets: `soketi start`
3. Start frontend dev server: `npm run dev`
4. Open http://localhost:5173 (or shown port)
5. Login with: `supervisor@example.com` / `password`

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS v3 Docs](https://tailwindcss.com/docs)
- [React Router v6](https://reactrouter.com/)
- [Leaflet Documentation](https://leafletjs.com/)
