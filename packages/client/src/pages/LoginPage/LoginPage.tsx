import { Button } from '@material-ui/core'
interface LoginPageProps {
  onLogin: () => void
}
const LoginPage = ({ onLogin }: LoginPageProps) => {
  return (
    <Button color="inherit" onClick={onLogin}>
      Login
    </Button>
  )
}

export default LoginPage
