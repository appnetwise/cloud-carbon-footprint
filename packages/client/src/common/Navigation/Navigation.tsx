import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from '@mui/material'
import { Cloud, ThumbUp } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 240,
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
  },
  listItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  listItemText: {
    fontSize: '12px',
    textAlign: 'center',
  },
}))

const Navigation = () => {
  const classes = useStyles()
  const navigate = useNavigate()

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      classes={{ paper: classes.drawerPaper }}
      anchor="left"
    >
      <List>
        <ListItem
          button
          onClick={() => navigate('/')}
          className={classes.listItem}
        >
          <Tooltip title="Connect with a Cloud" placement="right">
            <ListItemIcon>
              <Cloud />
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Cloud" className={classes.listItemText} />
        </ListItem>
        <ListItem
          button
          onClick={() => navigate('/recommendations')}
          className={classes.listItem}
        >
          <Tooltip title="Recommendation" placement="right">
            <ListItemIcon>
              <ThumbUp />
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Recommend" className={classes.listItemText} />
        </ListItem>
      </List>
    </Drawer>
  )
}

export default Navigation
