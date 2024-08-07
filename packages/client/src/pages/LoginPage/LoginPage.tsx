import { Button } from '@material-ui/core'
import useStyles from './loginPageStyles'
import { useAuth } from 'src/auth/AuthContext'

const LoginPage = () => {
  const classes = useStyles()
  const { login } = useAuth()
  return (
    <div className={classes.root}>
      <div className={classes.leftPanel}></div>
      <div className={classes.rightPanel}>
        <h2>Cloud Carbon Footprint</h2>
        <h3>Hello! Let's Get Started</h3>

        <Button variant="text" className={classes.loginButton} onClick={login}>
          Sign in
        </Button>
      </div>
    </div>
  )
}

export default LoginPage
