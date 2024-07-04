import axios from 'axios'
import { useState, useEffect } from 'react'
import { useAuth } from 'src/auth/AuthContext'
import { useProfile } from 'src/profile/ProfileContext'

const useGetUserProfile = (id, baseUrl) => {
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { token } = useAuth()
  const { setId } = useProfile()

  useEffect(() => {
    const getUserProfile = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await axios.get(`${baseUrl}/users/${id}`, {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        })
        const data = await response.data
        setUserProfile(data)
        setId(data.id)
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
