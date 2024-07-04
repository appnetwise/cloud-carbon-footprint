import { ClientConfig } from 'src/Config'
import loadConfig from 'src/ConfigLoader'
import { ProfileData } from './ProfileData'
import useGetUserProfile from 'src/utils/hooks/GetUserProfileHook'
import useGetUserProfileId from 'src/utils/hooks/GetUserProfileId'

interface ProfileContentProps {
  externalId: string
  config?: ClientConfig
}

const ProfileContent = ({
  config = loadConfig(),
  externalId,
}: ProfileContentProps) => {
  const { id } = useGetUserProfileId(externalId, config.BASE_URL)

  // Move the hook call outside the conditional rendering
  const { userProfile, loading, error } = useGetUserProfile(id, config.BASE_URL)

  if (id === null) {
    return null
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return <>{userProfile && <ProfileData graphData={userProfile} />}</>
}

export default ProfileContent
