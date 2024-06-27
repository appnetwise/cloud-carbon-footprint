import { Button, Typography } from '@material-ui/core'
import MicrosoftIcon from '@mui/icons-material/Microsoft'
import useStyles from './loginPageStyles'

import { Navigate } from 'react-router'
import { useAuth } from 'src/auth/AuthContext'

const LoginPage = () => {
  const classes = useStyles()
  const { isAuthenticated, login } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className={classes.root}>
      <div className={classes.leftPanel}></div>
      <div className={classes.rightPanel}>
        <Typography variant="h4" gutterBottom>
          Sign In
        </Typography>
        <Button
          variant="contained"
          color="primary"
          className={classes.loginButton}
          onClick={login}
        >
          <MicrosoftIcon className={classes.icon} />
          Sign in with Microsoft
        </Button>
        <div className={classes.signUpSection}>
          <Typography variant="body1">OR</Typography>
          <Button
            variant="outlined"
            color="secondary"
            className={classes.loginButton}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
