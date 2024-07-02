import { ReactElement, useCallback, useEffect, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { Container } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { PublicClientApplication } from '@azure/msal-browser'
import EmissionsMetricsPage from './pages/EmissionsMetricsPage'
import RecommendationsPage from './pages/RecommendationsPage/'
import ErrorPage from './layout/ErrorPage'
import HeaderBar from './layout/HeaderBar'
import MobileWarning from './layout/MobileWarning'
import LoadingMessage from './common/LoadingMessage'
import { formatAxiosError } from './layout/ErrorPage/ErrorPage'
import { ClientConfig } from './Config'
import loadConfig from './ConfigLoader'
import { useFootprintData } from './utils/hooks'
import { getEmissionDateRange } from './utils/helpers/handleDates'
import { msalConfig } from './auth/authConfig'
import ProtectedRoute from './protected/ProtectedRoute'
import LoginPage from './pages/LoginPage/LoginPage'
import { useIsAuthenticated } from '@azure/msal-react'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import HomePage from './pages/HomePage/HomePage'

interface AppProps {
  config?: ClientConfig
}

export function App({ config = loadConfig() }: AppProps): ReactElement {
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [mobileWarningEnabled, setMobileWarningEnabled] = useState<boolean>(
    window.innerWidth < 768,
  )
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()

  const msalInstance = new PublicClientApplication(msalConfig)

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize()
        const accounts = msalInstance.getAllAccounts()
        if (accounts.length > 0) {
          msalInstance.setActiveAccount(accounts[0])
        }
      } catch (error) {
        console.error('MSAL initialization error:', error)
      }
    }

    initializeMsal()
  }, [msalInstance])

  const handleLogout = async () => {
    try {
      await msalInstance.logoutRedirect()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const onApiError = useCallback(
    (error) => {
      console.error('API Error:', error)
      setErrorMessage(error.response?.data ?? 'An error occurred')
      navigate('/error', { state: formatAxiosError(error) })
    },
    [navigate],
  )

  const endDate = getEmissionDateRange({ config }).end
  const startDate = getEmissionDateRange({ config }).start

  const footprint = useFootprintData({
    baseUrl: config.BASE_URL,
    startDate,
    endDate,
    onApiError,
    groupBy: config.GROUP_BY,
    limit: parseInt(config.PAGE_LIMIT as string, 10),
    ignoreCache: config.DISABLE_CACHE,
  })

  const handleWarningClose = () => {
    setMobileWarningEnabled(false)
  }

  const useStyles = makeStyles(() => ({
    appContainer: {
      padding: 0,
      height: 'calc(100vh - 65px)',
    },
  }))

  const classes = useStyles()

  if (mobileWarningEnabled) {
    return (
      <Container maxWidth="xl" className={classes.appContainer}>
        <HeaderBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <MobileWarning handleClose={handleWarningClose} />
      </Container>
    )
  }

  if (footprint.loading) {
    return (
      <>
        <HeaderBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <LoadingMessage message="Loading cloud data. This may take a while..." />
      </>
    )
  }

  return (
    <>
      <HeaderBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Container maxWidth={false} className={classes.appContainer}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={
                  <EmissionsMetricsPage
                    config={config}
                    onApiError={onApiError}
                    footprint={footprint}
                  />
                }
              />
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<HomePage />}
              />
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={
                  <RecommendationsPage
                    config={config}
                    onApiError={onApiError}
                    footprint={footprint}
                  />
                }
              />
            }
          />
          <Route
            path="/error"
            element={<ErrorPage errorMessage={errorMessage} />}
          />
          <Route
            path="/login"
            element={<LoginPage baseUrl={config.BASE_URL} />}
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <HomePage />
              ) : (
                <LoginPage baseUrl={config.BASE_URL} />
              )
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<ProfilePage />}
              />
            }
          />
        </Routes>
      </Container>
    </>
  )
}
