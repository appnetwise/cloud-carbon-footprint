import { createContext, useContext, useEffect, useState } from 'react'
import { useMsal } from '@azure/msal-react'
import { InteractionRequiredAuthError } from '@azure/msal-browser'
import { loginRequest } from './authConfig'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const { instance, accounts } = useMsal()
  const [accessToken, setAccessToken] = useState(null)

  useEffect(() => {
    const acquireToken = async () => {
      if (accounts.length > 0) {
        const request = {
          ...loginRequest,
          account: accounts[0],
        }

        try {
          const response = await instance.acquireTokenSilent(request)
          setAccessToken(response.accessToken)
        } catch (error) {
          if (error instanceof InteractionRequiredAuthError) {
            try {
              const response = await instance.acquireTokenPopup(request)
              setAccessToken(response.accessToken)
            } catch (err) {
              console.error(err)
            }
          } else {
            console.error(error)
          }
        }
      }
    }

    acquireToken()
  }, [accounts, instance])

  return (
    <AuthContext.Provider value={{ accessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
