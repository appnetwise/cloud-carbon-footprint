import CloudCard from './CloudCard/CloudCard'
import { FaAws, FaGoogle, FaMicrosoft } from 'react-icons/fa'
import useStyles from './homePageStyles'
import { Typography } from '@material-ui/core'
import { useAuth } from 'src/auth/AuthContext'
import useConnectToCloud from 'src/utils/hooks/ConnectToCloudHook'

const HomePage = () => {
  const { connectToCloud } = useConnectToCloud()
  const handleConnect = async () => {
    try {
      await connectToCloud()
      console.log('Connected to Azure Cloud')
    } catch (error) {
      console.error('Failed to connect to Azure Cloud', error)
    }
  }
  const { isCloudConnected } = useAuth()
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
              icon={<FaAws size={100} />}
              description="This is a description"
              onConnect={() => console.log('Connected!')}
              isCloudConnected={false}
            ></CloudCard>
            <CloudCard
              id="2"
              name="Microsoft Azure"
              icon={<FaMicrosoft size={100} />}
              description="This is a description"
              onConnect={handleConnect}
              isCloudConnected={isCloudConnected}
            ></CloudCard>
            <CloudCard
              id="3"
              name="Google Cloud"
              icon={<FaGoogle size={100} />}
              description="This is a description"
              isCloudConnected={false}
              onConnect={() => console.log('Connected!')}
            ></CloudCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
