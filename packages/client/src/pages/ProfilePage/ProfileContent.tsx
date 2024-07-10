import { ClientConfig } from 'src/Config'
import loadConfig from 'src/ConfigLoader'
import { ProfileData } from './ProfileData'
import useGetUserProfile from 'src/utils/hooks/GetUserProfileHook'
import { useAuth } from 'src/auth/AuthContext'

interface ProfileContentProps {
  config?: ClientConfig
}

const ProfileContent = ({ config = loadConfig() }: ProfileContentProps) => {
  const { account } = useAuth()

  if (account === null) {
    return null
  }

  // Move the hook call outside the conditional rendering
  const { userProfile, loading, error } = useGetUserProfile(
    account.user.id,
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
