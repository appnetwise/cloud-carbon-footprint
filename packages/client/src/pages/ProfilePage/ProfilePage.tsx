import ProfileContent from './ProfileContent'
import useStyles from './profilePageStyles'
import { Grid } from '@material-ui/core'

const ProfilePage = () => {
  const classes = useStyles()

  return (
    <div className={classes.pageContainer}>
      <div className={classes.boxContainer}>
        <Grid container spacing={3}>
          <ProfileContent />
        </Grid>
      </div>
    </div>
  )
}

export default ProfilePage
