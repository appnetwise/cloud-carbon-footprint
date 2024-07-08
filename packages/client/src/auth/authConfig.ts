import { Configuration, LogLevel, PopupRequest } from '@azure/msal-browser'

// Config object to be passed to Msal on creation
export const msalConfig: Configuration = {
  auth: {
    authority: process.env.REACT_APP_MSAL_AUTHORITY,
    clientId: process.env.REACT_APP_MSAL_CLIENT_ID,
    redirectUri: process.env.REACT_APP_MSAL_REDIRECT_URI,
    postLogoutRedirectUri: process.env.REACT_APP_MSAL_POST_LOGOUT_REDIRECT_URI,
    navigateToLoginRequestUrl: false,
  },
  system: {
    allowNativeBroker: false, // Disables WAM Broker
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message)
            return
          case LogLevel.Info:
            console.info(message)
            return
          case LogLevel.Verbose:
            console.debug(message)
            return
          case LogLevel.Warning:
            console.warn(message)
            return
          default:
            return
        }
      },
      logLevel: LogLevel.Verbose,
    },
  },
}

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest: PopupRequest = {
  scopes: ['User.Read'],
}

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
}
