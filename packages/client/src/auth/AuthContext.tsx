import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { loginRequest } from './authConfig'

interface AuthContextType {
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => void
  token: string | null
  account: unknown | null
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const fetchToken = async () => {
      if (isAuthenticated && accounts.length > 0) {
        try {
          const response = await instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          })
          setToken(response.accessToken)
        } catch (error) {
          console.error('Silent token acquisition failed', error)
          if (error.name === 'InteractionRequiredAuthError') {
            try {
              const response = await instance.acquireTokenPopup(loginRequest)
              setToken(response.accessToken)
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
  }

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      login,
      logout,
      token,
      account: accounts[0] || null,
    }),
    [isAuthenticated, accounts, token],
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
