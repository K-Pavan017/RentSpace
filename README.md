# RentSpace - Real Estate Rental Platform

A modern, premium real estate rental platform inspired by Housing.com, built with React, Vite, Tailwind CSS, and Firebase.

## Features

✅ **Property Listing**: Owners can list properties with detailed information  
✅ **Location Selection**: GPS-enabled location picker for accurate property placement  
✅ **Image Upload**: Upload multiple property images to Firebase Storage  
✅ **Verified Listings**: Only verified properties are shown to users  
✅ **Advanced Sorting**: Sort properties by area, price, and date added  
✅ **Location Filtering**: Search properties by location/area  
✅ **Responsive Design**: Works seamlessly on desktop, tablet, and mobile  
✅ **Firebase Integration**: Real-time database and cloud storage  

## Project Structure

```
src/
├── components/
│   └── Navbar.jsx           # Navigation component
├── pages/
│   ├── Home.jsx             # Landing page with hero section
│   ├── AddProperty.jsx       # Property listing form
│   └── BrowseProperties.jsx  # Property browsing and filtering
├── App.jsx                  # Main app component with routing
├── firebaseConfig.js        # Firebase configuration
├── main.jsx                 # React entry point
└── index.css                # Global styles with Tailwind
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

Replace the Firebase config in `src/firebaseConfig.js` with your own credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Configure Firebase Security Rules

Add these Firestore security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /properties/{document=**} {
      allow read: if resource.data.verified == true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.ownerId;
    }
  }
}
```

### 4. Configure Firebase Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /properties/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Run the Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173`

## Key Features in Detail

### Add Property Page
- Fill in property details (title, description, area, price)
- Specify location with GPS or manual input
- Upload multiple images
- Properties are marked as unverified until admin approval

### Browse Properties
- View all verified listings
- Filter by location
- Sort by newest, price, or area
- View property details including bedrooms, bathrooms, and area

### Home Page
- Hero section with search functionality
- Why Choose Us section highlighting key features
- Featured properties section
- Statistics and trust indicators

## Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Storage**: Firebase Cloud Storage
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Utilities**: UUID for unique IDs

## Environment Variables

Create a `.env` file with Firebase credentials:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Build for Production

```bash
npm run build
```

## Future Enhancements

- User authentication with Firebase Auth
- Admin dashboard for property verification
- User reviews and ratings
- Advanced map integration with Google Maps API
- Video property tours
- Messaging system between owners and seekers
- Payment integration
- Email notifications

## License

MIT License - Feel free to use this project for personal or commercial purposes.

---

**Note**: This is a template. Replace Firebase configuration with your own credentials before deploying.
