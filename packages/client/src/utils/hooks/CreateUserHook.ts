import { useState, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from 'src/auth/AuthContext'

const useCreateUser = (baseUrl, isProfileLoaded) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const { token } = useAuth()

  const createUser = useCallback(
    async (userDetails) => {
      setLoading(true)
      setError(null)

      try {
        const response =
          isProfileLoaded &&
          (await axios.post(`${baseUrl}/users/`, userDetails, {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          }))
        setData(response.data)
      } catch (err) {
        setError(err.response ? err.response.data : err.message)
      } finally {
        setLoading(false)
      }
    },
    [baseUrl, isProfileLoaded],
  )

  return { createUser, loading, error, data }
}

export default useCreateUser
