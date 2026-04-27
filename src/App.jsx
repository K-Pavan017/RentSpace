import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import AddItem from './pages/AddItem'
import BrowseItems from './pages/BrowseItems'
import CategorySelection from './pages/CategorySelection'
import { auth } from './firebaseConfig'
import { useAuthState } from 'react-firebase-hooks/auth'
import Saved from './pages/Saved'
import Help from './pages/Help'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Chats from './pages/Chats'
import ChatRoom from './pages/ChatRoom'
import MyListings from './pages/MyListings'
import ContactUs from './pages/ContactUs'
import HowItWorks from './pages/HowItWorks'

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  const [user, loading] = useAuthState(auth)
  const location = useLocation()

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <main className="overflow-x-hidden">
        <div key={location.pathname} className="page-transition">
          <Routes location={location}>
            {/* Public Routes */}
            {/* Authentication Gateway */}
            <Route
              path="/"
              element={user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
            />

            <Route
              path="/login"
              element={user ? <Navigate to="/home" replace /> : <Login />}
            />

            <Route
              path="/signup"
              element={user ? <Navigate to="/home" replace /> : <Signup />}
            />

            {/* Protected Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute user={user}>
                  <Home />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-property"
              element={
                <ProtectedRoute user={user}>
                  <CategorySelection />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-item/:category"
              element={
                <ProtectedRoute user={user}>
                  <AddItem />
                </ProtectedRoute>
              }
            />

            <Route
              path="/saved"
              element={
                <ProtectedRoute user={user}>
                  <Saved />
                </ProtectedRoute>
              }
            />

            <Route
              path="/help"
              element={
                <ProtectedRoute user={user}>
                  <Help />
                </ProtectedRoute>
              }
            />

            <Route
              path="/contact"
              element={
                <ProtectedRoute user={user}>
                  <ContactUs />
                </ProtectedRoute>
              }
            />

            <Route
              path="/how-it-works"
              element={
                <ProtectedRoute user={user}>
                  <HowItWorks />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chats"
              element={
                <ProtectedRoute user={user}>
                  {/* We'll create this component next */}
                  <Chats />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat/:roomId"
              element={
                <ProtectedRoute user={user}>
                  {/* We'll create this component next */}
                  <ChatRoom />
                </ProtectedRoute>
              }
            />

            <Route
              path="/browse"
              element={
                <ProtectedRoute user={user}>
                  <BrowseItems />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-listings"
              element={
                <ProtectedRoute user={user}>
                  <MyListings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit-item/:id"
              element={
                <ProtectedRoute user={user}>
                  <AddItem />
                </ProtectedRoute>
              }
            />

          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App