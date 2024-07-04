import { createContext, useContext, useState, ReactNode } from 'react'

interface ProfileContextType {
  id: string | null
  setId: (id: string | null) => void
}

const ProfileContext = createContext<ProfileContextType | null>(null)

interface ProfileProviderProps {
  children: ReactNode
}

export const ProfileProvider = ({ children }: ProfileProviderProps) => {
  const [id, setId] = useState<string | null>(null)

  const contextValue = {
    id,
    setId,
  }

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
