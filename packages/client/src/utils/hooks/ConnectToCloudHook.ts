import { useState } from 'react'
import { useAuth } from 'src/auth/AuthContext'

const useConnectToCloud = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { isCloudConnected, connectToCloud } = useAuth()

  const handleConnectToCloud = async () => {
    setLoading(true)
    try {
      await connectToCloud()
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
