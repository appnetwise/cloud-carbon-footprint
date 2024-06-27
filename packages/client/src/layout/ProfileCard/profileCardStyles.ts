import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  card: {
    width: '100%',
    height: '100%',
    boxShadow: '0px 16px 30px 0px rgba(151, 151, 151, .25)',
    borderRadius: 12,
  },
  contentContainer: {
    height: '100%',
  },
  cardContent: {
    height: '100%',
    width: '100%',
    boxShadow: 'none',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 !important',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    marginRight: theme.spacing(2),
  },
  name: {
    fontSize: '24px',
    fontWeight: 900,
    color: 'rgba(0, 0, 0, 0.87)',
  },
  detail: {
    fontSize: '16px',
    color: 'rgba(0, 0, 0, 0.54)',
  },
  updateProfileButton: {
    marginTop: theme.spacing(2),
  },
}))

export default useStyles
