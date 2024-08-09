import { makeStyles, Theme } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) => ({
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
    padding: theme.spacing(3, 5),
    backgroundColor: '#ffffff', // Keeping the background white as per your request
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0c7264',
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    fontSize: '1.5rem',
    textAlign: 'center',
    color: '#095a4d',
    marginBottom: theme.spacing(2),
  },
  tagline: {
    fontSize: '1.25rem',
    textAlign: 'center',
    color: '#0c7264',
    marginBottom: theme.spacing(3),
    fontWeight: 500,
  },
  description: {
    fontSize: '1rem',
    textAlign: 'center',
    marginBottom: theme.spacing(3),
    color: '#444',
    maxWidth: '80%',
  },
  featuresList: {
    listStyleType: 'none',
    padding: 0,
    marginBottom: theme.spacing(4),
    textAlign: 'left',
    color: '#444',
    '& li': {
      marginBottom: theme.spacing(1),
      display: 'flex',
      alignItems: 'center',
      '& svg': {
        marginRight: theme.spacing(1),
        color: '#0c7264',
      },
    },
  },
  loginButton: {
    width: '60%',
    backgroundColor: '#0c7264 !important',
    color: 'white !important',
    fontSize: '1rem',
    fontWeight: 600,
    padding: '12px 25px',
    borderRadius: '30px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#095a4d !important',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(12, 114, 100, 0.2)',
    },
  },
  socialProof: {
    marginTop: theme.spacing(3),
    textAlign: 'center',
    color: '#666',
    fontSize: '0.9rem',
  },
  learnMore: {
    marginTop: theme.spacing(2),
    color: '#0c7264',
    textDecoration: 'underline',
    cursor: 'pointer',
    '&:hover': {
      color: '#095a4d',
    },
  },
}))

export default useStyles
