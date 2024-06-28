import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { jwtDecode } from 'jwt-decode'
import { loginRequest } from './authConfig'

interface AuthContextType {
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => void
  token: string | null
  account: unknown | null
  tokenProfile: TokenProfile | null
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

interface TokenProfile {
  externalId: string
  firstName: string
  lastName: string
  nickName: string
  email: string
  id?: string
}

interface DecodedToken {
  oid: string
  given_name: string
  family_name: string
  name: string
  unique_name: string
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const [token, setToken] = useState<string | null>(null)
  const [tokenProfile, setTokenProfile] = useState<TokenProfile | null>(null)
  useEffect(() => {
    const fetchToken = async () => {
      if (isAuthenticated && accounts.length > 0) {
        try {
          const response = await instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          })
          setToken(response.accessToken)
          const decodedToken = jwtDecode(response.accessToken) as DecodedToken
          setTokenProfile({
            externalId: decodedToken.oid,
            firstName: decodedToken.given_name,
            lastName: decodedToken.family_name,
            nickName: decodedToken.name,
            email: decodedToken.unique_name,
          })
        } catch (error) {
          console.error('Silent token acquisition failed', error)
          if (error.name === 'InteractionRequiredAuthError') {
            try {
              const response = await instance.acquireTokenPopup(loginRequest)
              setToken(response.accessToken)
              const decodedToken: DecodedToken = jwtDecode(response.accessToken)
              setTokenProfile({
                externalId: decodedToken.oid,
                firstName: decodedToken.given_name,
                lastName: decodedToken.family_name,
                nickName: decodedToken.name,
                email: decodedToken.unique_name,
              })
            } catch (error) {
              console.error('Interactive token acquisition failed', error)
            }
          }
        }
      }
    }

    fetchToken()
  }, [isAuthenticated, accounts, instance])

  const login = async () => {
    try {
      await instance.loginRedirect(loginRequest)
    } catch (error) {
      console.error('Login failed', error)
    }
  }

  const logout = () => {
    instance.logoutPopup()
    setToken(null)
    setTokenProfile(null)
  }

  const updateTokenProfile = (updatedProfile: Partial<TokenProfile>) => {
    setTokenProfile((prevProfile) => ({
      ...prevProfile,
      ...updatedProfile,
    }))
  }

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      login,
      logout,
      token,
      account: accounts[0] || null,
      tokenProfile,
      setTokenProfile: updateTokenProfile,
    }),
    [isAuthenticated, accounts, token, tokenProfile],
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
