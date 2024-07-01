import { Button, Card, Divider, Typography } from '@material-ui/core'
import useStyles from './cloudCardStyles'
import clsx from 'clsx'
interface CloudCardProps {
  id: string
  name: string
  icon: React.ReactElement
  description: string
  onConnect: () => void
}

const CloudCard = ({ id, name, icon, onConnect }: CloudCardProps) => {
  const classes = useStyles()
  return (
    <Card data-testid={`cloud-card-${id}`} className={classes.card}>
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
          >
            <Typography>Connect</Typography>
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default CloudCard
