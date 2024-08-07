import axios from 'axios'
import { KeycloakTokenParsed } from 'keycloak-js'
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from 'react'
import { User } from 'src/types/User'
import keycloak from 'src/utils/auth/keycloakConfig'
import { getKeycloakToken } from 'src/utils/auth/keyCloakUtil'
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
  const [userId, setUserId] = useState(null)
  const { userExists } = useCheckUserExists(user?.externalId, baseUrl)
  const { createUser } = useCreateUser(baseUrl, !!user)
  const keycloakInitialized = useRef(false) // Ref to track initialization state

  const getUserProfileId = useCallback(
    async (externalId) => {
      if (userId) {
        return // Skip the call if userId is already set
      }

      try {
        const token = await getKeycloakToken()
        const response = await axios.get(
          `${baseUrl}/users/external/${externalId}`,
          {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          },
        )
        const data = response.data
        setUserId(data.id)
        setIsCloudConnected(data?.cloudConnections?.azure.connected || false)
      } catch (error) {
        console.error('Error fetching user ID:', error)
      }
    },
    [baseUrl, userId],
  )

  const getAccount = useCallback(async () => {
    if (!userId) {
      console.log('Waiting for user ID...')
      return
    }

    try {
      const token = await getKeycloakToken()
      const response = await axios.get(
        `${baseUrl}/users/${userId}/cloud-connect-info`,
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        },
      )
      const data = response.data
      setIsAuthenticated(data ? true : false)
      setIsCloudConnected(data?.azure || false)
      setAccount(data)
    } catch (error) {
      console.error('Failed to fetch account information', error)
      setIsAuthenticated(false)
      setIsCloudConnected(false)
      setAccount(null)
    } finally {
      setIsLoading(false)
    }
  }, [baseUrl, userId])

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

  const updateUserInfo = useCallback(() => {
    if (keycloak.tokenParsed) {
      const tokenParsed = keycloak.tokenParsed as KeycloakTokenParsed
      const userInfo = {
        externalId: tokenParsed.sub,
        email: tokenParsed.email,
        firstName: tokenParsed.given_name,
        lastName: tokenParsed.family_name,
        nickName: tokenParsed.name,
      } as User
      setUser(userInfo)
      getUserProfileId(tokenParsed.sub)
    }
  }, [getUserProfileId])

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        if (!keycloakInitialized.current) {
          keycloakInitialized.current = true
          const authenticated = await keycloak.init({
            onLoad: 'check-sso',
            redirectUri: `${window.location.origin}/home`,
          })
          if (authenticated) {
            updateUserInfo()
            setIsAuthenticated(true)
          }
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

  const connectToCloud = useCallback(
    async (token) => {
      try {
        const response = await fetch(`${baseUrl}/auth/connect`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
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
    },
    [baseUrl],
  )
  return (
    <AuthContext.Provider
      value={{
        account,
        isLoading,
        isAuthenticated,
        isCloudConnected,
        isFirstVisit,
        user,
        userId,
        setUserId,
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
