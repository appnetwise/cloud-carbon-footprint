import keycloak from './keycloakConfig'

export const getKeycloakToken = async (): Promise<string | null> => {
  try {
    await keycloak.updateToken(10) // Refresh the token if it's older than 5 seconds
    return keycloak.token || null
  } catch (error) {
    console.error('Failed to refresh the token', error)
    return null
  }
}
