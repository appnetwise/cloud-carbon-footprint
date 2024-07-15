const msal = require('@azure/msal-node')
const fs = require('fs')

export const REDIRECT_URI = process.env.MSAL_REDIRECT_URI
export const REDIRECT_CONNECT_URI = process.env.MSAL_REDIRECT_CONNECT_URI
export const POST_LOGIN_REDIRECT_URI = process.env.MSAL_POST_LOGIN_REDIRECT_URI
export const POST_LOGOUT_REDIRECT_URI =
  process.env.MSAL_POST_LOGOUT_REDIRECT_URI
export const POST_CONNECT_REDIRECT_URI =
  process.env.MSAL_POST_CONNECT_REDIRECT_URI
export const GRAPH_ME_ENDPOINT = 'https://graph.microsoft.com/v1.0/me'
export const AZURE_SERVICES_ENDPOINT = 'https://management.azure.com/.default'

export const SESSION_COLLECTION_NAME = 'user_sessions'
export const SESSION_COOKIE_NAME = 'anw.ccf.session'
export const STATE_COOKIE_NAME = 'anw.ccf.state'
export const CONNECT_STATE_COOKIE_NAME = 'anw.ccf.connect.state'

/**
 * For enhanced security, consider using client certificates instead of secrets.
 * See README-use-certificate.md for more.
 */
export const msalConfig = {
  auth: {
    authority: process.env.MSAL_AUTHORITY,
    clientId: process.env.MSAL_CLIENT_ID,
    clientSecret: process.env.MSAL_SECRET,
    clientCapabilities: ['CP1'], // this let's the resource know this client is capable of handling claims challenges
    // clientCertificate: {
    //     thumbprint: "YOUR_CERT_THUMBPRINT",
    //     privateKey: fs.readFileSync('PATH_TO_YOUR_PRIVATE_KEY_FILE'),
    // }
  },
}
