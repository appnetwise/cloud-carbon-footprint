import { useMemo } from 'react'
import { defaultTheme } from './utils/themes'
import loadConfig from './ConfigLoader'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@material-ui/core'
import { App } from './App'
import { AuthProvider } from './auth/AuthContext'
import CustomMsalProvider from './auth/CustomMsalProvider'

export function Root() {
  const theme = useMemo(() => defaultTheme(), [])
  const config = useMemo(() => loadConfig(), [])

  return (
    <CustomMsalProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <App config={config} />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </CustomMsalProvider>
  )
}
