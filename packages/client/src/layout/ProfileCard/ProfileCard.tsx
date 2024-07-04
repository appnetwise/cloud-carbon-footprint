import { FunctionComponent } from 'react'
import clsx from 'clsx'
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@material-ui/core'
import useStyles from './profileCardStyles'

type ProfileCardProps = {
  name: string
  email: string
  displayName?: string
  role?: string
  avatar?: string
  noPadding?: boolean
  id?: string
  testId?: string
  containerClass?: string
}

const ProfileCard: FunctionComponent<ProfileCardProps> = ({
  name,
  email,
  displayName,
  role,
  avatar,
  noPadding,
  id,
  testId,
  containerClass,
}) => {
  const classes = useStyles()

  return (
    <Grid item xs={12} className={clsx(containerClass)} data-testid={testId}>
      <Card id={id} className={clsx(classes.card)}>
        <Box className={classes.contentContainer} padding={noPadding ? 0 : 3}>
          <div className={classes.header}>
            {avatar && (
              <img src={avatar} alt="avatar" className={classes.avatar} />
            )}
            <Typography className={classes.name}>{name}</Typography>
          </div>
          <CardContent className={classes.cardContent}>
            <Typography className={classes.detail}>{displayName}</Typography>
            <Typography className={classes.detail}>{email}</Typography>
            <Typography className={classes.detail}>{role}</Typography>
            <Button
              variant="contained"
              color="primary"
              className={classes.updateProfileButton}
            >
              <Typography>Update Profile</Typography>
            </Button>
          </CardContent>
        </Box>
      </Card>
    </Grid>
  )
}

export default ProfileCard
