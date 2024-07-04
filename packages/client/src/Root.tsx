import { useMemo } from 'react'
import { defaultTheme } from './utils/themes'
import loadConfig from './ConfigLoader'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@material-ui/core'
import { App } from './App'
import { AuthProvider } from './auth/AuthContext'
import CustomMsalProvider from './auth/CustomMsalProvider'
import { ProfileProvider } from './profile/ProfileContext'

export function Root() {
  const theme = useMemo(() => defaultTheme(), [])
  const config = useMemo(() => loadConfig(), [])

  return (
    <CustomMsalProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <ProfileProvider>
              <App config={config} />
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </CustomMsalProvider>
  )
}
