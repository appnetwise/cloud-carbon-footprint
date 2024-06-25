import { useEffect, useMemo, useState } from 'react'
import { defaultTheme } from './utils/themes'
import loadConfig from './ConfigLoader'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@material-ui/core'
import { App } from './App'
import { MsalProvider } from '@azure/msal-react' // Import MsalProvider from the appropriate module
import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfig } from './authConfig'
import { AuthProvider } from './AuthContext'

export function Root() {
  const theme = useMemo(() => defaultTheme(), [])
  const config = useMemo(() => loadConfig(), [])
  const [msalInstance, setMsalInstance] = useState(null)

  useEffect(() => {
    const initializeMsal = async () => {
      const instance = new PublicClientApplication(msalConfig)
      await instance.initialize()
      setMsalInstance(instance)
    }

    initializeMsal()
  }, [])

  if (!msalInstance) {
    return <div>Loading...</div> // or any other loading indicator
  }
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MsalProvider instance={msalInstance}>
          <AuthProvider>
            <App config={config} />
          </AuthProvider>
        </MsalProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
