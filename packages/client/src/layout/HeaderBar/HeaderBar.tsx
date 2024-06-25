import { AppBar, Toolbar, Typography, Button } from '@material-ui/core'
import { ReactElement } from 'react'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import useStyles from './headerBarStyles'
import logo from './ccf_logo.png'
import { useMsal } from '@azure/msal-react'

interface HeaderBarProps {
  isAuthenticated: boolean
  onLogin: () => void
  onLogout: () => void
}

const HeaderBar = ({
  isAuthenticated,
  onLogin,
  onLogout,
}: HeaderBarProps): ReactElement => {
  const classes = useStyles()
  const { accounts } = useMsal()

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
          >
            Welcome {accounts[0]?.name}
          </Typography>
        </NavLink>
        <div className={classes.navLinks}>
          {isAuthenticated ? (
            <>
              <NavLink
                to="/recommendations"
                className={clsx(classes.navLink, {
                  isActive: classes.activeNavLink,
                })}
              >
                <Typography component="h2">RECOMMENDATIONS</Typography>
              </NavLink>

              <Button color="inherit" onClick={onLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={onLogin}>
              Login
            </Button>
          )}
        </div>
      </Toolbar>
    </AppBar>
  )
}

export default HeaderBar
