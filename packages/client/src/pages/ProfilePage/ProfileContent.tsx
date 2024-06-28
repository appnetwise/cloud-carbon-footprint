import { ClientConfig } from 'src/Config'
import loadConfig from 'src/ConfigLoader'
import { ProfileData } from './ProfileData'
import useGetUserProfile from 'src/utils/hooks/GetUserProfileHook'

interface ProfileContentProps {
  externalId: string
  config?: ClientConfig
}

const ProfileContent = ({
  config = loadConfig(),
  externalId,
}: ProfileContentProps) => {
  const { userProfile, loading, error } = useGetUserProfile(
    externalId,
    config.BASE_URL,
  )

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return <>{userProfile && <ProfileData graphData={userProfile} />}</>
}

export default ProfileContent
