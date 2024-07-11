import { useState } from 'react'
import axios from 'axios'

const useConnectToCloud = (baseUrl) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isCloudConnected, setIsCloudConnected] = useState(false)

  const connectToCloud = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${baseUrl}/auth/connect`)
      if (response.data && response.data.authUrl) {
        setIsCloudConnected(true)
        window.location.href = response.data.authUrl
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, isCloudConnected, connectToCloud }
}

export default useConnectToCloud
