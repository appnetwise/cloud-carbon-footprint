import { ReactNode } from 'react'
import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfig } from './authConfig'
import { MsalProvider } from '@azure/msal-react'

const msalInstance = new PublicClientApplication(msalConfig)

interface CustomMsalProviderProps {
  children: ReactNode
}
const CustomMsalProvider = ({ children }: CustomMsalProviderProps) => {
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>
}

export default CustomMsalProvider
