import CloudCard from './CloudCard/CloudCard'
import { FaAws, FaGoogle, FaMicrosoft } from 'react-icons/fa'
import useStyles from './homePageStyles'
import { Typography } from '@material-ui/core'
import { useAuth } from 'src/auth/AuthContext'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const { connectToCloud } = useAuth()
  const navigate = useNavigate()
  const handleConnect = async () => {
    try {
      await connectToCloud()
      console.log('Connected to Azure Cloud')
      navigate('/')
    } catch (error) {
      console.error('Failed to connect to Azure Cloud', error)
    }
  }
  const classes = useStyles()
  return (
    <div className={classes.pageContainer}>
      <div className={classes.boxContainer}>
        <div className={classes.mainContainer}>
          <Typography variant="h5">Connect to a cloud provider</Typography>
          <div className={classes.cloudContainer}>
            <CloudCard
              id="1"
              name="Amazon AWS"
              icon={<FaAws size={50} />}
              description="This is a description"
              onConnect={() => console.log('Connected!')}
            ></CloudCard>
            <CloudCard
              id="2"
              name="Microsoft Azure"
              icon={<FaMicrosoft size={50} />}
              description="This is a description"
              onConnect={handleConnect}
            ></CloudCard>
            <CloudCard
              id="3"
              name="Google Cloud"
              icon={<FaGoogle size={50} />}
              description="This is a description"
              onConnect={() => console.log('Connected!')}
            ></CloudCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
