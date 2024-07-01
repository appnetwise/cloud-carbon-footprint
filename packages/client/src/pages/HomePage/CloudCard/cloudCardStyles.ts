/*
 * © 2021 Thoughtworks, Inc.
 */

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  card: {
    backgroundColor: '#0c7264',
    flex: '1 1 200px',
    maxWidth: 300,
    height: 350,
    border: '5px solid #0c7264',
    borderRadius: 15,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    backgroundColor: '#0c7264',
    height: 64,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  title: {
    fontStyle: 'normal',
    fontWeight: 'normal',
    textAlign: 'center',
    fontSize: 20,
    color: 'white',
  },
  textContent: {
    fontSize: 36,
    textAlign: 'center',
  },

  divider: {
    backgroundColor: '#0c7264',
    width: '75%',
    height: 4,
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
    gap: 30,
  },
  contentWithBadge: {
    gap: 25,
  },
  numberContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#0c7264',
    border: 'none',
    borderRadius: '5px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px',
    fontWeight: 500,
    padding: '12px 25px',
    position: 'relative',
    textAlign: 'center',
    transition: '.5s',
    zIndex: 1,
    '&:hover': {
      backgroundColor: '#095a4d' /* Desired hover color */,
    },
  },
}))

export default useStyles
