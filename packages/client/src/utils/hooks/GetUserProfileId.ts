import axios from 'axios'
import { useState, useEffect } from 'react'
import { useProfile } from 'src/auth/ProfileContext'
import { getKeycloakToken } from '../auth/keyCloakUtil'

const useGetUserProfileId = (externalId, baseUrl) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { id, setId } = useProfile()

  useEffect(() => {
    const getUserProfile = async () => {
      if (id) {
        return // Skip the call if id is already set
      }

      setLoading(true)
      setError(null)

      try {
        const token = await getKeycloakToken()
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
  }, [externalId, id])

  return { id, loading, error }
}

export default useGetUserProfileId
