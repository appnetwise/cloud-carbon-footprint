import React from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  isAuthenticated: boolean
  element: React.ReactElement
}

const ProtectedRoute = ({ isAuthenticated, element }: ProtectedRouteProps) => {
  return isAuthenticated ? element : <Navigate to="/login" />
}

export default ProtectedRoute
