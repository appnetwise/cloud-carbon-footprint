import { InteractionType } from '@azure/msal-browser'
import { MsalAuthenticationTemplate } from '@azure/msal-react'
import { loginRequest } from 'src/auth/authConfig'

const ProtectedRoute = ({ element }) => {
  const ErrorComponent = ({ error }) => {
    console.error(error)
    return <p>An authentication error occurred. Please try again.</p>
  }

  const LoadingComponent = () => <p>Authentication in progress...</p>

  return (
    <MsalAuthenticationTemplate
      interactionType={InteractionType.Redirect}
      authenticationRequest={loginRequest}
      errorComponent={ErrorComponent}
      loadingComponent={LoadingComponent}
    >
      {element}
    </MsalAuthenticationTemplate>
  )
}

export default ProtectedRoute
