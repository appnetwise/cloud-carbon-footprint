import { useState } from 'react'
import { useAuth } from 'src/auth/AuthContext'
import { getKeycloakToken } from '../auth/keyCloakUtil'

const useConnectToCloud = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { isCloudConnected, connectToCloud } = useAuth()

  const handleConnectToCloud = async () => {
    setLoading(true)
    setError(null) // Reset error state before starting a new request
    try {
      const token = await getKeycloakToken()
      if (token) {
        await connectToCloud(token)
      } else {
        throw new Error('Failed to retrieve token')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    isCloudConnected,
    connectToCloud: handleConnectToCloud,
  }
}

export default useConnectToCloud
