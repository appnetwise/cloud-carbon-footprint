import { useMemo } from 'react'
import { defaultTheme } from './utils/themes'
import loadConfig from './ConfigLoader'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@material-ui/core'
import { App } from './App'
import { MsalProvider } from '@azure/msal-react' // Import MsalProvider from the appropriate module
import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfig } from './authConfig'

export function Root() {
  const theme = useMemo(() => defaultTheme(), [])
  const config = useMemo(() => loadConfig(), [])

  const msalInstance = new PublicClientApplication(msalConfig)
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MsalProvider instance={msalInstance}>
          <App config={config} />
        </MsalProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
