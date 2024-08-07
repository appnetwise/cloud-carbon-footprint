import Keycloak, { KeycloakConfig } from 'keycloak-js'

const keycloakConfig: KeycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL,
  realm: process.env.REACT_APP_KEYCLOAK_REALM || 'ccf',
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID ?? 'spa-client-demo',
}

const keycloak = new Keycloak(keycloakConfig)

export default keycloak
