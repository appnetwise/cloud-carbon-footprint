import { useState } from 'react'
import axios from 'axios'

const useLoginUser = (baseUrl) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${baseUrl}/auth/login`)
      if (response.status === 200) {
        setData(response.data)
      } else {
        setError('Failed to login')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, login }
}

export default useLoginUser
