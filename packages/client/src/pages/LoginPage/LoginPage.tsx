import { Button, Typography } from '@material-ui/core'
import useStyles from './loginPageStyles'
import { useAuth } from 'src/auth/AuthContext'
import LoadingMessage from 'src/common/LoadingMessage'
import useCheckUserExists from 'src/utils/hooks/CheckUserHook'
import { useEffect } from 'react'
import useCreateUser from 'src/utils/hooks/CreateUserHook'
import { useNavigate } from 'react-router'
import useLoginUser from 'src/utils/hooks/LoginUserHook'

interface LoginPageProps {
  baseUrl: string
}

const LoginPage = ({ baseUrl }: LoginPageProps) => {
  const classes = useStyles()
  const { isAuthenticated, tokenProfile: profile } = useAuth()

  const { login } = useLoginUser(baseUrl)

  const { userExists, loading: userExistsLoading } = useCheckUserExists(
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

  const navigate = useNavigate()
  useEffect(() => {
    if (isAuthenticated && profile) {
      if (!userExistsLoading && !creatingUser) {
        if (userExists === false && data?.id) {
          navigate('/home')
        }
        if (userExists === true) {
          navigate('/home')
        }
      }
    }
  }, [
    isAuthenticated,
    profile,
    userExists,
    userExistsLoading,
    creatingUser,
    data,
    navigate, // Added navigate to the dependency array
  ])

  if (isAuthenticated && profile) {
    if (userExistsLoading || creatingUser) {
      return <LoadingMessage message="Checking user data..." />
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
          <img
            className={classes.icon}
            src={'microsoft_logo.svg'}
            alt="Microsoft Logo"
          />
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
