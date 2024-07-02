import { Button, Card, Divider, Typography } from '@material-ui/core'
import useStyles from './cloudCardStyles'
import clsx from 'clsx'

interface CloudCardProps {
  id: string
  name: string
  icon: React.ReactElement
  description: string
  isCloudConnected?: boolean
  onConnect: () => void
}

const CloudCard = ({
  id,
  name,
  icon,
  isCloudConnected = false,
  onConnect,
}: CloudCardProps) => {
  const classes = useStyles()

  return (
    <Card
      data-testid={`cloud-card-${id}`}
      className={clsx(classes.card, {
        [classes.disabledCard]: isCloudConnected,
      })}
    >
      <div className={classes.titleContainer}>
        <Typography className={classes.title}>{name}</Typography>
      </div>

      <div className={clsx(classes.contentContainer)}>
        <div>{icon}</div>

        <Divider variant="middle" className={classes.divider} />
        <div>
          <Button
            variant="contained"
            color="primary"
            className={classes.connectButton}
            onClick={onConnect}
            disabled={isCloudConnected}
          >
            <Typography>Connect</Typography>
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default CloudCard
