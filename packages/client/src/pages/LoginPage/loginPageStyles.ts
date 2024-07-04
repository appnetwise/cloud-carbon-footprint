import { makeStyles, Theme } from '@material-ui/core/styles'
const useStyles = makeStyles((theme: Theme) => ({
  boxContainer: {
    padding: theme.spacing(3, 10),
  },
  root: {
    display: 'flex',
    height: '100vh',
    padding: theme.spacing(2),
  },
  leftPanel: {
    background: 'url(/ccf_login_min.webp) no-repeat center center',
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
  button: {
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
  loginButton: {
    width: '60%',
    marginTop: 20,
    backgroundColor: '#0c7264',
    border: 'none',
    borderRadius: '5px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px',
    fontWeight: 500,
    padding: '12px 25px',
    position: 'relative',
    textAlign: 'center',
    transition: '.5s',
    zIndex: 1,
    '&:hover': {
      backgroundColor: '#095a4d' /* Desired hover color */,
    },
  },
}))

export default useStyles
