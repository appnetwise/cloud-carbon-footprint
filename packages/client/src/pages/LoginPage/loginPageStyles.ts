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
  title: {
    fontSize: '1.875rem', // Equivalent to text-3xl
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0c7264',
    marginBottom: theme.spacing(2), // Equivalent to space-y-6
  },
  subtitle: {
    fontSize: '1.25rem', // Equivalent to text-xl
    textAlign: 'center',
    marginBottom: theme.spacing(2), // Equivalent to space-y-6
  },
  loginButton: {
    width: '48%',
    marginTop: 20,
    backgroundColor: '#0c7264 !important', // Force the background color
    border: 'none',
    borderRadius: '5px',
    color: 'white !important', // Force the text color
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
      backgroundColor: '#095a4d', // Desired hover color
    },
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
