import {
  AppBar,
  IconButton,
  Menu,
  Toolbar,
  Typography,
} from '@material-ui/core'
import { ReactElement, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import useStyles from './headerBarStyles'
import logo from './ccf_logo.png'
import { MenuItem, Avatar } from '@material-ui/core'
import { useMsal } from '@azure/msal-react'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import { useAuth } from 'src/auth/AuthContext'

interface HeaderBarProps {
  isAuthenticated: boolean
  onLogout: () => void
}

const HeaderBar = ({
  isAuthenticated,
  onLogout,
}: HeaderBarProps): ReactElement => {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { accounts } = useMsal()
  const { cloudToken } = useAuth()
  const navigate = useNavigate()

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    navigate('/profile')
  }

  return (
    <AppBar
      position="sticky"
      square={true}
      className={classes.appBar}
      id="app-bar-header"
    >
      <Toolbar className={classes.navContainer}>
        <NavLink to="/" className={classes.title}>
          <img
            src={logo}
            alt={'Cloud Carbon Footprint Logo'}
            className={classes.logo}
          />
          <Typography component="h1" variant="h5">
            Cloud Carbon Footprint
          </Typography>
          <Typography
            component="h2"
            variant="h5"
            className={classes.welcomeMessage}
          ></Typography>
        </NavLink>
        <div className={classes.navLinks}>
          {cloudToken === '' || cloudToken === null ? (
            <></>
          ) : (
            <>
              <NavLink
                to="/recommendations"
                className={clsx(classes.navLink, {
                  isActive: classes.activeNavLink,
                })}
              >
                <Typography component="h2">RECOMMENDATIONS</Typography>
              </NavLink>
            </>
          )}
          {isAuthenticated ? (
            <>
              <NavLink
                to="/home"
                className={clsx(classes.navLink, {
                  isActive: classes.activeNavLink,
                })}
              >
                <Typography component="h2">CONNECT TO CLOUD</Typography>
              </NavLink>
              <IconButton edge="end" color="inherit" onClick={handleMenuOpen}>
                <Avatar alt="User Profile" className={classes.avtar} />
                {accounts[0].name}
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                className={classes.profileMenu}
              >
                <MenuItem onClick={handleMenuClose}>
                  <PersonIcon />
                  Profile
                </MenuItem>
                <MenuItem onClick={onLogout}>
                  <LogoutIcon />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <></>
          )}
        </div>
      </Toolbar>
    </AppBar>
  )
}

export default HeaderBar
