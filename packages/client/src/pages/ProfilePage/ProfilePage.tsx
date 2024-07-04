import { useAuth } from 'src/auth/AuthContext'
import ProfileContent from './ProfileContent'
import useStyles from './profilePageStyles'
import { Grid } from '@material-ui/core'

const ProfilePage = () => {
  const { isAuthenticated, tokenProfile } = useAuth()

  const classes = useStyles()

  if (!isAuthenticated || !tokenProfile) {
    return null
  }
  return (
    <div className={classes.pageContainer}>
      <div className={classes.boxContainer}>
        <Grid container spacing={3}>
          <ProfileContent externalId={tokenProfile.externalId} />
        </Grid>
      </div>
    </div>
  )
}

export default ProfilePage
