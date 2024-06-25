import { Button, Typography } from '@material-ui/core'
import MicrosoftIcon from '@mui/icons-material/Microsoft'
import useStyles from './loginPageStyles'
interface LoginPageProps {
  onLogin: () => void
}
const LoginPage = ({ onLogin }: LoginPageProps) => {
  const classes = useStyles()

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
          onClick={onLogin}
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
            onClick={() => console.log('Sign Up clicked')}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
