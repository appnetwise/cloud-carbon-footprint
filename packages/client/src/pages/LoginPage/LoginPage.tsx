import { Button } from '@mui/material'
import { useAuth } from 'src/auth/AuthContext'
import useStyles from './loginPageStyles'

const LoginPage = () => {
  const classes = useStyles()
  const { login } = useAuth()

  return (
    <div className={classes.root}>
      <div className={classes.leftPanel}></div>
      <div className={classes.rightPanel}>
        <h2 className={classes.title}>Cloud Carbon Footprint</h2>
        <h3 className={classes.subtitle}>Hello! Let's Get Started</h3>

        <Button className={classes.loginButton} onClick={login}>
          Sign in
        </Button>
      </div>
    </div>
  )
}

export default LoginPage
