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


function App() {
  const [user] = useAuthState(auth)
  const location = useLocation()

  

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      
      <main>
        <Routes>   
          

        <Route 
          path="/" 
          element={<Login />}
        />
        <Route 
          path="/signup" 
          element={<Signup />}
        />
          <Route
            path="/home"
            element={<Home /> }
          />

          <Route
            path="/add-property"
            element={<CategorySelection />} 
          />

          <Route
            path="/add-item/:category"
            element={ <AddItem /> }
          />
          <Route path="/saved" element={<Saved />} />
          <Route
            path="/help"
            element={ <Help />}
          />


          <Route
            path="/browse"
            element={ <BrowseItems />}
          />

        </Routes>
      </main>
    </div>
  )
}

export default App
