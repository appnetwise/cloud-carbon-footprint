import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from 'src/auth/AuthContext'

const AuthMiddleware = ({ children }) => {
  const { isAuthenticated, getAccount } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(async () => {
      await getAccount()
      if (!isAuthenticated) {
        navigate('/login')
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [isAuthenticated, getAccount, navigate])

  return <>{children}</>
}

export default AuthMiddleware
