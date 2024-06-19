import { useEffect, useState } from 'react'
import { useMsal } from '@azure/msal-react'

import { Button } from '@material-ui/core'

import { ProfileData } from '../ProfileData/ProfileData'
import { callMsGraph } from 'src/graph'
import { loginRequest } from 'src/authConfig'
import { useAuth } from 'src/AuthContext'

const ProfileContent = () => {
  const { instance, accounts } = useMsal()
  const [graphData, setGraphData] = useState(null)

  const { accessToken } = useAuth()

  useEffect(() => {
    if (accessToken) {
      console.log('Access Token:', accessToken)
    }
  }, [accessToken])

  function RequestProfileData() {
    // Silently acquires an access token which is then attached to a request for MS Graph data
    instance
      .acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      })
      .then((response) => {
        callMsGraph(response.accessToken).then((response) =>
          setGraphData(response),
        )
      })
  }

  return (
    <>
      <h5 className="profileContent">Welcome {accounts[0]?.name}</h5>
      {graphData ? (
        <ProfileData graphData={graphData} />
      ) : (
        <Button onClick={RequestProfileData}>Request Profile</Button>
      )}
    </>
  )
}

export default ProfileContent
