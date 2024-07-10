import React from 'react'
import { Navigate } from 'react-router-dom'
import LoadingMessage from 'src/common/LoadingMessage'

interface ProtectedRouteProps {
  isAuthenticated: boolean
  isLoading: boolean
  element: React.ReactElement
}

const ProtectedRoute = ({
  isAuthenticated,
  isLoading,
  element,
}: ProtectedRouteProps) => {
  if (isLoading) {
    return <LoadingMessage message="Checking authentication..." />
  }

  return isAuthenticated ? element : <Navigate to="/login" replace />
}

export default ProtectedRoute
