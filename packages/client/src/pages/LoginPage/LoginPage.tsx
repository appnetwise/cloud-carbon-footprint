import { Button, Typography } from '@material-ui/core'
import { Navigate } from 'react-router'
import useStyles from './loginPageStyles'
import { useAuth } from 'src/auth/AuthContext'
import LoadingMessage from 'src/common/LoadingMessage'
import useCheckUserExists from 'src/utils/hooks/CheckUserHook'
import { useEffect } from 'react'
import useCreateUser from 'src/utils/hooks/CreateUserHook'

interface LoginPageProps {
  baseUrl: string
}

const LoginPage = ({ baseUrl }: LoginPageProps) => {
  const classes = useStyles()
  const { isAuthenticated, login, tokenProfile: profile } = useAuth()
  const { userExists, loading } = useCheckUserExists(
    profile ? profile.externalId : null,
    baseUrl,
  )
  const {
    createUser,
    loading: creatingUser,
    data,
  } = useCreateUser(baseUrl, !!profile)

  useEffect(() => {
    if (isAuthenticated && profile && userExists === false) {
      const userDetails = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        nickName: profile.nickName,
        email: profile.email,
        isExternal: true,
        externalId: profile.externalId,
      }

      createUser(userDetails)
    }
  }, [isAuthenticated, profile, userExists, createUser])

  if (isAuthenticated && profile) {
    if (loading || creatingUser) {
      return <LoadingMessage message="Checking user data..." />
    }

    if (userExists === false && !creatingUser && data?.id) {
      return <Navigate to="/home" replace />
    }

    if (userExists === true) {
      return <Navigate to="/home" replace />
    }
  }

  return (
    <div className={classes.root}>
      <div className={classes.leftPanel}></div>
      <div className={classes.rightPanel}>
        <Typography variant="h4" gutterBottom>
          Sign In
        </Typography>

        <Button variant="text" className={classes.loginButton} onClick={login}>
          <img className={classes.icon} src={'microsoft_logo.svg'} />
          Sign in with Microsoft
        </Button>
        <div className={classes.signUpSection}>
          <Typography variant="body1">OR</Typography>
          <Button variant="text" className={classes.loginButton}>
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
