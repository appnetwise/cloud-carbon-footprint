import { useState } from 'react'
import axios from 'axios'

const useLogoutUser = (baseUrl) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const logout = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${baseUrl}/auth/logout`)
      if (response.data && response.data.authUrl) {
        // Redirect to Microsoft login page
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

  return { loading, error, logout }
}

export default useLogoutUser
