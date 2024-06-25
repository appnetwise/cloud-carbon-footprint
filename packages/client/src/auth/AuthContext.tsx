import { createContext, useContext, useMemo } from 'react'
import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { loginRequest } from './authConfig'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  const login = async () => {
    try {
      await instance.loginRedirect(loginRequest)
    } catch (error) {
      console.error('Login failed', error)
    }
  }

  const logout = () => {
    instance.logoutPopup()
  }

  const getToken = async () => {
    if (!accounts[0]) {
      throw new Error('No active account')
    }
    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      })
      return response.accessToken
    } catch (error) {
      console.error('Silent token acquisition failed', error)
      if (error.name === 'InteractionRequiredAuthError') {
        try {
          const response = await instance.acquireTokenPopup(loginRequest)
          return response.accessToken
        } catch (error) {
          console.error('Interactive token acquisition failed', error)
          throw error
        }
      }
      throw error
    }
  }

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      login,
      logout,
      getToken,
      account: accounts[0] || null,
    }),
    [isAuthenticated, accounts],
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
