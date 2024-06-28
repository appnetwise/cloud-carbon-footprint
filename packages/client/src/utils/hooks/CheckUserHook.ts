import axios from 'axios'
import { useState, useEffect } from 'react'
import { useAuth } from 'src/auth/AuthContext'

const useCheckUserExists = (externalId, baseUrl) => {
  const [userExists, setUserExists] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { token } = useAuth()

  useEffect(() => {
    const checkUserExists = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await axios.get(
          `${baseUrl}/users/external/${externalId}/exists`,
          {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          },
        )
        const data = await response.data
        setUserExists(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (externalId) {
      checkUserExists()
    }
  }, [externalId])

  return { userExists, loading, error }
}

export default useCheckUserExists
