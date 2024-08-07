import { KeycloakTokenParsed } from 'keycloak-js'
import React, { useState, useEffect, useContext, useCallback } from 'react'
import { User } from 'src/types/User'
import keycloak from 'src/utils/auth/keycloakConfig'
import useCheckUserExists from 'src/utils/hooks/CheckUserHook'
import useCreateUser from 'src/utils/hooks/CreateUserHook'

export const AuthContext = React.createContext(null)
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children, baseUrl }) => {
  const [account, setAccount] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCloudConnected, setIsCloudConnected] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(true) // New state for first visit
  const [user, setUser] = useState<User>()
  const [token, setToken] = useState<string | null>(null)
  const { userExists } = useCheckUserExists(user?.externalId, baseUrl)
  const { createUser } = useCreateUser(baseUrl, !!user)

  const initOptions = {
    onLoad: 'login-required',
    redirectUri: `${window.location.origin}/home`, // Relative URL resolved to absolute
  }

  const login = useCallback(() => {
    keycloak.login(initOptions)
  }, [])

  const logout = useCallback(() => {
    keycloak.logout({
      redirectUri: `${window.location.origin}/login`,
    })
  }, [])

  const getAccount = useCallback(async () => {
    const response = await fetch(`${baseUrl}/auth/account`)
    const data = await response.json()
    console.log(data)
    setIsAuthenticated(data ? true : false)
    setIsCloudConnected(data?.user.isCloudConnected || false)
    setAccount(data)
    setIsLoading(false)
  }, [baseUrl])

  const updateUserInfo = useCallback(() => {
    console.log(keycloak)
    if (keycloak.tokenParsed) {
      const tokenParsed = keycloak.tokenParsed as KeycloakTokenParsed
      console.log(tokenParsed)
      const userInfo = {
        externalId: tokenParsed.sub,
        email: tokenParsed.email,
        firstName: tokenParsed.given_name,
        lastName: tokenParsed.family_name,
        nickName: tokenParsed.name,
      } as User
      setUser(userInfo)
      setToken(keycloak.token)
      console.log(keycloak.token)
    }
  }, [])

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          redirectUri: `${window.location.origin}/home`,
        })
        if (authenticated) {
          updateUserInfo()
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Failed to initialize Keycloak', error)
      } finally {
        setIsLoading(false)
      }
    }

    initKeycloak()
  }, [updateUserInfo])

  useEffect(() => {
    if (isAuthenticated && user) {
      // No need to call checkUserExists function explicitly
      // The hook already performs the check and sets the userExists state
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (isAuthenticated && user && userExists === false) {
      const userDetails = {
        firstName: user.firstName,
        lastName: user.lastName,
        nickName: user.nickName,
        email: user.email,
        isExternal: true,
        externalId: user.externalId,
      }
      createUser(userDetails)
    }
  }, [isAuthenticated, user, userExists, createUser])

  const connectToCloud = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/auth/connect`)
      const data = await response.json()
      if (data && data.authUrl) {
        setIsCloudConnected(true)
        setIsFirstVisit(true) // Reset isFirstVisit on connect
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
        user,
        token,
        setToken,
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
