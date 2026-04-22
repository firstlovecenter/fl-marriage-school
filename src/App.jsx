import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import PastorPage from './pages/PastorPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import { isAdminAuthenticated } from './lib/adminAuth'

function ProtectedAdminRoute({ children }) {
  return isAdminAuthenticated() ? children : <Navigate to='/admin' replace />
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path='/' element={<LandingPage />} />
        <Route path='/register/:sessionId' element={<RegisterPage />} />
        <Route path='/pastor/:token' element={<PastorPage />} />

        {/* Admin routes */}
        <Route path='/admin' element={<AdminLoginPage />} />
        <Route
          path='/admin/dashboard'
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPage />
            </ProtectedAdminRoute>
          }
        />

        {/* Catch all */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </Router>
  )
}
