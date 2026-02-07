# Autoverse - Automotive Discovery Platform

Production-ready automotive platform for discovering and comparing cars and bikes.

## 🚀 Features

- **Browse Vehicles**: 500+ cars and bikes from RapidAPI
- **Smart Filters**: Filter by brand, price, fuel type
- **Compare**: Side-by-side comparison of up to 3 vehicles
- **Reviews**: Customer reviews and ratings
- **EMI Calculator**: Calculate monthly payments
- **OTP Authentication**: Secure phone-based login
- **Responsive Design**: Works on mobile, tablet, desktop

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- React Router v6
- Axios
- Vanilla CSS

### Backend
- Node.js + Express
- MongoDB (for users/auth)
- RapidAPI (for vehicle data)
- JWT Authentication
- Twilio (OTP)

## 📦 Installation

### Prerequisites
- Node.js v18+
- MongoDB (or MongoDB Atlas account)
- RapidAPI account (free)

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (see `.env.example`):
```env
MONGODB_URI=your-mongodb-connection-string
RAPIDAPI_KEY=your-rapidapi-key
RAPIDAPI_CAR_HOST=car-data.p.rapidapi.com
RAPIDAPI_BIKE_HOST=motorcycle-specs-database.p.rapidapi.com
```

Start server:
```bash
npm run dev
```

Server runs on: `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs on: `http://localhost:5174`

## 🔑 Getting RapidAPI Key

1. Go to https://rapidapi.com
2. Create free account
3. Subscribe to Car Data API
4. Subscribe to Motorcycle API
5. Copy API key and host names to `.env`

See detailed guide: `docs/rapidapi_integration_guide.md`

## 📡 API Endpoints

### Vehicles
```
GET  /api/vehicles?type=car|bike          Get vehicles
GET  /api/vehicles/:slug                  Get vehicle by slug
GET  /api/vehicles/meta/brands?type=      Get brands
GET  /api/vehicles/search/query?q=        Search vehicles
```

### Authentication
```
POST /api/auth/send-otp                   Send OTP
POST /api/auth/verify-otp                 Verify & login
```

### Leads
```
POST /api/leads                           Create lead (protected)
GET  /api/leads/my-leads                  Get user leads (protected)
```

## 🖼️ Features

### Home Page
- Hero with search
- Popular vehicles (from RapidAPI)
- Trending carousel
- Brand grid
- Upcoming vehicles
- Customer reviews
- Recently viewed

### Listing Page
- Dynamic vehicle cards
- Filter by brand, price, fuel
- Sort by rating/price
- Pagination

### Detail Page
- Vehicle specifications
- Image gallery
- Price by city
- EMI calculator (protected)
- Similar vehicles
- Contact/callback options

### Comparison
- Add up to 3 vehicles
- Side-by-side specs
- Price comparison
- Remove/clear options

## 🔐 Authentication

- OTP-based login (phone number)
- JWT tokens (7-day expiry)
- Protected routes (EMI, Profile, Leads)
- Twilio integration (production)

## 🎨 Design System

Colors:
- Primary: `#0A1A44` (Navy Blue)
- Accent: `#FF3D00` (Orange-Red)
- Background: `#F7F8FA` (Light Gray)

Typography:
- Headers: Bold, 700-800 weight
- Body: Regular, 400 weight

## 📂 Project Structure

```
autoverse/
├── backend/
│   ├── config/          # Database config
│   ├── routes/          # API routes
│   ├── services/        # RapidAPI service
│   ├── middleware/      # Auth, error handling
│   └── server.js        # Express server
│
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── context/     # React context
    │   ├── services/    # API service
    │   └── App.jsx      # Main app
    └── index.html
```

## 🧪 Testing

### Backend
```bash
# Health check
GET http://localhost:5000/api/health

# Test vehicles
GET http://localhost:5000/api/vehicles?type=car&limit=8
```

### Frontend
1. Open `http://localhost:5174`
2. Toggle between Cars/Bikes
3. Test filters and search
4. Try comparison feature
5. Test authentication

## 🚀 Deployment

### Backend
- Deploy to: Render, Railway, Heroku
- Set environment variables
- Keep RapidAPI keys secure

### Frontend
- Deploy to: Vercel, Netlify
- Update API URL in production
- Build: `npm run build`

### Database
- Use MongoDB Atlas (cloud)
- Create production cluster
- Update connection string

## 📊 RapidAPI Integration

- **Vehicle Data**: Fetched in real-time from RapidAPI
- **Fallback System**: Mock data if API fails
- **Unified Format**: Same response for cars and bikes
- **No OpenAI**: Completely removed from project

Data Flow:
```
Frontend → Backend API → RapidAPI → Normalize → Return
```

## 🐛 Troubleshooting

**Frontend not loading data?**
- Check backend is running on port 5000
- Verify CORS settings in server.js

**"Failed to fetch vehicles"?**
- Check RapidAPI key in `.env`
- Verify API subscriptions are active
- Check console for errors

**Images not showing?**
- RapidAPI provides image URLs
- Fallback placeholders if unavailable

## 📝 License

MIT

## 👥 Support

For issues or questions:
- Check documentation in `docs/`
- Review RapidAPI integration guide
- Test APIs with Postman

---

Built with ❤️ for automotive enthusiasts
