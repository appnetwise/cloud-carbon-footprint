import { Button, Typography } from '@material-ui/core'
import useStyles from './loginPageStyles'
import { useAuth } from 'src/auth/AuthContext'

const LoginPage = () => {
  const classes = useStyles()
  const { login } = useAuth()
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
