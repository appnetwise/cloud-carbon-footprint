import { ReactElement, useCallback, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { Container } from '@material-ui/core'
import { ClientConfig } from './Config'
import loadConfig from './ConfigLoader'
import HomePage from './pages/HomePage/HomePage'
import LoginPage from './pages/LoginPage/LoginPage'
import HeaderBar from './layout/HeaderBar'
import ErrorPage from './layout/ErrorPage/ErrorPage'
import { getEmissionDateRange } from './utils/helpers/handleDates'
import { useFootprintData } from './utils/hooks'
import LoadingMessage from './common/LoadingMessage'
import EmissionsMetricsPage from './pages/EmissionsMetricsPage'
import RecommendationsPage from './pages/RecommendationsPage'
import { useAuth } from './auth/AuthContext'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import ProtectedRoute from './protected/ProtectedRoute'

interface AppProps {
  config?: ClientConfig
}

export function App({ config = loadConfig() }: AppProps): ReactElement {
  console.log(config)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  const onApiError = useCallback(
    (error) => {
      console.error('API Error:', error)
      setErrorMessage(error.response?.data ?? 'An error occurred')
      // navigate('/error', { state: formatAxiosError(error) })
    },
    [navigate],
  )

  const endDate = getEmissionDateRange({ config }).end
  const startDate = getEmissionDateRange({ config }).start

  const shouldFetchFootprint =
    !['/login'].includes(location.pathname) &&
    ['/dashboard'].includes(location.pathname)

  const footprint = useFootprintData(
    {
      baseUrl: config.BASE_URL,
      startDate,
      endDate,
      onApiError,
      groupBy: config.GROUP_BY,
      limit: parseInt(config.PAGE_LIMIT as string, 10),
      ignoreCache: config.DISABLE_CACHE,
    },
    shouldFetchFootprint,
  )

  console.log(footprint)
  if (footprint.loading) {
    return (
      <>
        <HeaderBar />
        <LoadingMessage message="Loading cloud data. This may take a while..." />
      </>
    )
  }

  return (
    <Pages
      footprint={footprint}
      onApiError={onApiError}
      errorMessage={errorMessage}
      isAuthenticated={isAuthenticated}
      isLoading={isLoading}
    />
  )
}
function Pages({
  config = loadConfig(),
  footprint,
  onApiError,
  errorMessage,
  isAuthenticated,
  isLoading,
}) {
  const useStyles = makeStyles(() => ({
    appContainer: {
      padding: 0,
      height: 'calc(100vh - 65px)',
    },
  }))

  const classes = useStyles()
  console.log(isAuthenticated)
  return (
    <>
      <HeaderBar />
      <Container maxWidth={false} className={classes.appContainer}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
                element={<HomePage />}
              ></ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
                element={
                  <EmissionsMetricsPage
                    config={config}
                    onApiError={onApiError}
                    footprint={footprint}
                  />
                }
              ></ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
                element={
                  <RecommendationsPage
                    config={config}
                    onApiError={onApiError}
                    footprint={footprint}
                  />
                }
              ></ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
                element={<ProfilePage />}
              ></ProtectedRoute>
            }
          />

          <Route
            path="/error"
            element={<ErrorPage errorMessage={errorMessage} />}
          />
        </Routes>
      </Container>
    </>
  )
}
