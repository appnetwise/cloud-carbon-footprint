import { useState, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from 'src/auth/AuthContext'
import { getKeycloakToken } from '../auth/keyCloakUtil'

const useCreateUser = (baseUrl, isProfileLoaded) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const auth = useAuth()
  console.log(auth) // Log the entire auth object

  // Then destructure only the properties you need
  // const { token } = auth || {}

  const createUser = useCallback(
    async (userDetails) => {
      setLoading(true)
      setError(null)

      try {
        const token = await getKeycloakToken()
        const response =
          isProfileLoaded &&
          token &&
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
