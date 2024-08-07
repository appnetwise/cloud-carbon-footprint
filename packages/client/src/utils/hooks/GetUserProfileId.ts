import axios from 'axios'
import { useState, useEffect } from 'react'
import { useAuth } from 'src/auth/AuthContext'
import { useProfile } from 'src/auth/ProfileContext'

const useGetUserProfileId = (externalId, baseUrl) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { token } = useAuth()
  const { id, setId } = useProfile()

  useEffect(() => {
    const getUserProfile = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await axios.get(
          `${baseUrl}/users/external/${externalId}`,
          {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          },
        )
        const data = await response.data
        setId(data.id)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (externalId) {
      getUserProfile()
    }
  }, [externalId])

  return { id, loading, error }
}

export default useGetUserProfileId
