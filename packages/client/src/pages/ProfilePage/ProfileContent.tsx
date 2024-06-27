import { useEffect, useState } from 'react'
import { useMsal } from '@azure/msal-react'

import { callMsGraph } from 'src/graph'
import { ClientConfig } from 'src/Config'
import loadConfig from 'src/ConfigLoader'
import { ProfileData } from './ProfileData'

interface ProfileContentProps {
  config?: ClientConfig
}

const ProfileContent = ({ config = loadConfig() }: ProfileContentProps) => {
  const { instance, accounts } = useMsal()
  const [graphData, setGraphData] = useState(null)

  useEffect(() => {
    RequestProfileData()
  }, [])

  function RequestProfileData() {
    // Silently acquires an access token which is then attached to a request for MS Graph data
    instance
      .acquireTokenSilent({
        scopes: ['User.Read'],
        account: accounts[0],
      })
      .then((response) => {
        callMsGraph(response.accessToken, config.BASE_URL).then((response) =>
          setGraphData(response),
        )
      })
  }

  return <>{graphData && <ProfileData graphData={graphData} />}</>
}

export default ProfileContent
