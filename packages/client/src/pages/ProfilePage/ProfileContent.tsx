import { ClientConfig } from 'src/Config'
import loadConfig from 'src/ConfigLoader'
import { ProfileData } from './ProfileData'
import useGetUserProfile from 'src/utils/hooks/GetUserProfileHook'
import { useAuth } from 'src/auth/AuthContext'

interface ProfileContentProps {
  config?: ClientConfig
}

const ProfileContent = ({ config = loadConfig() }: ProfileContentProps) => {
  const { user } = useAuth()

  if (user === null) {
    return null
  }

  const { userId } = useAuth()

  // Move the hook call outside the conditional rendering
  const { userProfile, loading, error } = useGetUserProfile(
    userId,
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
