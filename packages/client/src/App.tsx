import { ReactElement, useCallback, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
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
import ProfilePage from './pages/ProfilePage/ProfilePage'

interface AppProps {
  config?: ClientConfig
}

export function App({ config = loadConfig() }: AppProps): ReactElement {
  console.log(config)
  const [errorMessage, setErrorMessage] = useState<string>('')
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

  const shouldFetchFootprint = !['/login'].includes(location.pathname)

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
    />
  )
}
function Pages({ config = loadConfig(), footprint, onApiError, errorMessage }) {
  const useStyles = makeStyles(() => ({
    appContainer: {
      padding: 0,
      height: 'calc(100vh - 65px)',
    },
  }))

  const classes = useStyles()
  return (
    <>
      <HeaderBar />
      <Container maxWidth={false} className={classes.appContainer}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route
            path="/dashboard"
            element={
              <EmissionsMetricsPage
                config={config}
                onApiError={onApiError}
                footprint={footprint}
              />
            }
          />
          <Route
            path="/recommendations"
            element={
              <RecommendationsPage
                config={config}
                onApiError={onApiError}
                footprint={footprint}
              />
            }
          />
          <Route path="/profile" element={<ProfilePage />} />

          <Route
            path="/error"
            element={<ErrorPage errorMessage={errorMessage} />}
          />
        </Routes>
      </Container>
    </>
  )
}
