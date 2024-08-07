import axios from 'axios'
import { useState, useEffect } from 'react'
import { getKeycloakToken } from '../auth/keyCloakUtil'

const useGetUserProfile = (id, baseUrl) => {
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getUserProfile = async () => {
      setLoading(true)
      setError(null)
      const token = await getKeycloakToken()

      try {
        const response = await axios.get(`${baseUrl}/users/${id}`, {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        })
        const data = await response.data
        setUserProfile(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      getUserProfile()
    }
  }, [id])

  return { userProfile, loading, error }
}

export default useGetUserProfile
