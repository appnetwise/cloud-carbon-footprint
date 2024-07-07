import { useEffect, useState, useMemo } from 'react'
import { defaultTheme } from './utils/themes'
import loadConfig from './ConfigLoader'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@material-ui/core'
import { App } from './App'
import {
  AuthenticationResult,
  EventMessage,
  EventType,
  PublicClientApplication,
} from '@azure/msal-browser'
import { msalConfig } from './auth/authConfig'
import { AuthProvider } from './auth/AuthContext'
import { MsalProvider } from '@azure/msal-react'
import { ProfileProvider } from './profile/ProfileContext'

export function Root() {
  const theme = useMemo(() => defaultTheme(), [])
  const config = useMemo(() => loadConfig(), [])
  const [msalInstance, setMsalInstance] =
    useState<PublicClientApplication | null>(null)

  useEffect(() => {
    const instance = new PublicClientApplication(msalConfig)

    instance.initialize().then(() => {
      const accounts = instance.getAllAccounts()
      console.log('MSAL initialized, accounts:', accounts)
      if (accounts.length > 0) {
        instance.setActiveAccount(accounts[0])
      }

      instance.addEventCallback((event: EventMessage) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
          const payload = event.payload as AuthenticationResult
          const account = payload.account
          console.log('Login success, setting active account:', account)
          instance.setActiveAccount(account)
        }
      })

      setMsalInstance(instance)
    })
  }, [])

  if (!msalInstance) {
    return null // or a loading spinner if you prefer
  }

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MsalProvider instance={msalInstance}>
          <AuthProvider>
            <ProfileProvider>
              <App config={config} pca={msalInstance} />
            </ProfileProvider>
          </AuthProvider>
        </MsalProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
