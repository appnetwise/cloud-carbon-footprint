import React, { useState, useEffect, useContext } from 'react'
import useLoginUser from 'src/utils/hooks/LoginUserHook'
import useLogoutUser from 'src/utils/hooks/LogoutUserHook'

export const AuthContext = React.createContext(null)
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children, baseUrl }) => {
  const [account, setAccount] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { login } = useLoginUser(baseUrl)
  const { logout } = useLogoutUser(baseUrl)

  const getAccount = async () => {
    const response = await fetch(`${baseUrl}/auth/account`)
    const data = await response.json()
    setIsAuthenticated(data ? true : false)
    setAccount(data)

    setIsLoading(false)
  }

  useEffect(() => {
    getAccount()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        account,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
