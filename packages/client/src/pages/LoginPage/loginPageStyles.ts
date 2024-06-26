import { makeStyles } from '@material-ui/core/styles'
const useStyles = makeStyles(({ spacing }) => ({
  boxContainer: {
    padding: spacing(3, 10),
  },
  root: {
    display: 'flex',
    height: '100vh',
    padding: spacing(2),
  },
  leftPanel: {
    backgroundSize: 'cover',
    flex: 1,
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  loginButton: {
    marginTop: 20,
    width: '60%',
  },
  signUpSection: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
}))

export default useStyles
