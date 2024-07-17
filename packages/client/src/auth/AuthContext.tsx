import React, { useState, useEffect, useContext, useCallback } from 'react'
import useLoginUser from 'src/utils/hooks/LoginUserHook'
import useLogoutUser from 'src/utils/hooks/LogoutUserHook'

export const AuthContext = React.createContext(null)
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children, baseUrl }) => {
  const [account, setAccount] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCloudConnected, setIsCloudConnected] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(true) // New state for first visit
  const { login } = useLoginUser(baseUrl)
  // const { logout } = useLogoutUser(baseUrl)
  const { logout: performLogout } = useLogoutUser(baseUrl)

  const logout = useCallback(async () => {
    await performLogout()
    setIsFirstVisit(true) // Reset isFirstVisit on logout
  }, [performLogout])

  const getAccount = useCallback(async () => {
    const response = await fetch(`${baseUrl}/auth/account`)
    const data = await response.json()
    console.log(data)
    setIsAuthenticated(data ? true : false)
    setIsCloudConnected(data?.user.isCloudConnected || false)
    setAccount(data)
    setIsLoading(false)
  }, [baseUrl])

  useEffect(() => {
    getAccount()
  }, [getAccount, isAuthenticated, isCloudConnected])

  const connectToCloud = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/auth/connect`)
      const data = await response.json()
      if (data && data.authUrl) {
        setIsCloudConnected(true)
        window.location.href = data.authUrl
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Failed to connect to cloud', error)
    }
  }, [baseUrl])

  return (
    <AuthContext.Provider
      value={{
        account,
        isLoading,
        isAuthenticated,
        isCloudConnected,
        isFirstVisit,
        setIsFirstVisit,
        setIsCloudConnected,
        login,
        logout,
        connectToCloud,
        getAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
