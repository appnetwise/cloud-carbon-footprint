import { useMemo } from 'react'
import { defaultTheme } from './utils/themes'
import loadConfig from './ConfigLoader'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@material-ui/core'
import { App } from './App'
import { AuthProvider } from './auth/AuthContext'
import AuthMiddleware from './auth/AuthMiddleware'

export function Root() {
  const theme = useMemo(() => defaultTheme(), [])
  const config = useMemo(() => loadConfig(), [])

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider baseUrl={config.BASE_URL}>
          <AuthMiddleware>
            <App config={config} />
          </AuthMiddleware>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
