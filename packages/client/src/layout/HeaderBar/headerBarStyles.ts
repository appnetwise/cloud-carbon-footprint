import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      flexGrow: 1,
    },
    logo: {
      height: 32,
    },
    navContainer: {
      justifyContent: 'space-between',
      alignItems: 'center', // Ensure items are centered vertically
    },
    title: {
      display: 'flex',
      alignItems: 'center', // Ensure the logo and title are centered vertically
      gap: theme.spacing(2),
      color: 'inherit',
      textDecoration: 'inherit',
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center', // Ensure nav links and button are centered vertically
      gap: theme.spacing(2), // Add spacing between nav links and button
    },
    navLink: {
      fontSize: theme.typography.fontSize,
      marginRight: theme.spacing(3), // Adjust spacing as needed
      position: 'relative',
      overflow: 'hidden',
      color: 'inherit',
      textDecoration: 'inherit',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '0.15em',
        backgroundColor: 'white',
        opacity: 1,
        transition: 'opacity 300ms, transform 300ms',
        transform: 'translate3d(-110%, 0, 0)',
      },
      // Animations for underline on hover
      '&:hover::after': {
        transform: 'translate3d(0, 0, 0)',
      },
      '&:focus::after': {
        transform: 'translate3d(0, 0, 0)',
      },
    },
    activeNavLink: {
      '&::after': {
        transform: 'translate3d(0, 0, 0)',
      },
    },
    welcomeMessage: {
      fontSize: '0.875rem', // Adjust the font size to be smaller
      marginLeft: theme.spacing(2), // Add some spacing between the logo/title and the welcome message
    },
  }),
)

export default useStyles
