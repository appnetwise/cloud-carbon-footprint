import {
  NodeAuthOptions,
  BrokerOptions,
  CacheOptions,
  NodeSystemOptions,
  NodeTelemetryOptions,
  CryptoProvider,
  ConfidentialClientApplication,
  ResponseMode,
  InteractionRequiredAuthError,
} from '@azure/msal-node'
import axios from 'axios'
import {
  msalConfig,
  REDIRECT_URI,
  POST_LOGIN_REDIRECT_URI,
  POST_LOGOUT_REDIRECT_URI,
  AZURE_SERVICES_ENDPOINT,
  CONNECT_STATE_COOKIE_NAME,
  GRAPH_ME_ENDPOINT,
  SESSION_COOKIE_NAME,
  STATE_COOKIE_NAME,
  POST_CONNECT_REDIRECT_URI,
  REDIRECT_CONNECT_URI,
} from '../authConfig'
import { getClaims } from '../utils/claimUtils'
import { BaseUser } from '../users/user'
import * as userService from '../users/user.service'
import jwt from 'jsonwebtoken'

class AuthProvider {
  config: {
    msalConfig: {
      auth: NodeAuthOptions
      broker?: BrokerOptions
      cache?: CacheOptions
      system?: NodeSystemOptions
      telemetry?: NodeTelemetryOptions
    }
    redirectUri: any
    redirectConnectUri: any
    postLoginRedirectUri: any
    postLogoutRedirectUri: any
    postConnectRedirectUri: any
  }
  cryptoProvider: CryptoProvider

  constructor(config: any) {
    this.config = config
    this.cryptoProvider = new CryptoProvider()
  }

  getMsalInstance() {
    return new ConfidentialClientApplication(this.config.msalConfig)
  }

  async login(req, res, next, options = {} as any) {
    /**
     * MSAL Node allows you to pass your custom state as state parameter in the Request object.
     * The state parameter can also be used to encode information of the app's state before redirect.
     * You can pass the user's state in the app, such as the page or view they were on, as input to this parameter.
     */
    const state = this.cryptoProvider.base64Encode(
      JSON.stringify({
        csrfToken: this.cryptoProvider.createNewGuid(), // create a GUID for csrf
        redirectTo: options.postLoginRedirectUri
          ? options.postLoginRedirectUri
          : this.config.postLoginRedirectUri
          ? this.config.postLoginRedirectUri
          : '/',
      }),
    )

    const authCodeUrlRequestParams = {
      state: state,
      /**
       * By default, MSAL Node will add OIDC scopes to the auth code url request. For more information, visit:
       * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
       */
      scopes: options.scopesToConsent ? options.scopesToConsent.split(' ') : [],
      claims: getClaims(
        req.session,
        this.config.msalConfig.auth.clientId,
        GRAPH_ME_ENDPOINT,
      ),
    }

    const authCodeRequestParams = {
      state: state,
      /**
       * By default, MSAL Node will add OIDC scopes to the auth code request. For more information, visit:
       * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
       */
      scopes: options.scopesToConsent ? options.scopesToConsent.split(' ') : [],
      claims: getClaims(
        req.session,
        this.config.msalConfig.auth.clientId,
        GRAPH_ME_ENDPOINT,
      ),
    }

    /**
     * If the current msal configuration does not have cloudDiscoveryMetadata or authorityMetadata, we will
     * make a request to the relevant endpoints to retrieve the metadata. This allows MSAL to avoid making
     * metadata discovery calls, thereby improving performance of token acquisition process.
     */
    if (
      !this.config.msalConfig.auth.cloudDiscoveryMetadata ||
      !this.config.msalConfig.auth.authorityMetadata
    ) {
      const [cloudDiscoveryMetadata, authorityMetadata] = await Promise.all([
        this.getCloudDiscoveryMetadata(),
        this.getAuthorityMetadata(),
      ])

      this.config.msalConfig.auth.cloudDiscoveryMetadata = JSON.stringify(
        cloudDiscoveryMetadata,
      )
      this.config.msalConfig.auth.authorityMetadata =
        JSON.stringify(authorityMetadata)
    }

    const msalInstance = this.getMsalInstance()

    return this.redirectToAuthCodeUrl(
      req,
      res,
      next,
      authCodeUrlRequestParams,
      authCodeRequestParams,
      msalInstance,
    )
  }

  async redirectToAuthCodeUrl(
    req,
    res,
    next,
    authCodeUrlRequestParams,
    authCodeRequestParams,
    msalInstance,
  ) {
    const { verifier, challenge } =
      await this.cryptoProvider.generatePkceCodes()

    const authCodeUrlRequest = {
      redirectUri: this.config.redirectUri,
      responseMode: ResponseMode.FORM_POST, // recommended for confidential clients
      codeChallenge: challenge,
      codeChallengeMethod: 'S256',
      ...authCodeUrlRequestParams,
    }

    const cookiePayload = {
      pkceCodes: {
        verifier: verifier,
      },
      authCodeRequest: {
        redirectUri: this.config.redirectUri,
        ...authCodeRequestParams,
      },
    }

    try {
      const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(
        authCodeUrlRequest,
      )

      /**
       * Web apps using OIDC form_post flow for authentication rely on cross-domain
       * cookies for security. Here we designate the cookie with sameSite=none to ensure we can retrieve
       * state after redirect from the Azure AD takes place. For more information, visit:
       * https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-handle-samesite-cookie-changes-chrome-browser
       */
      res.cookie(STATE_COOKIE_NAME, cookiePayload, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      res.json({ authUrl: authCodeUrlResponse })
    } catch (error) {
      next(error)
    }
  }

  async handleRedirect(req, res, next) {
    const authCodeRequest = {
      ...req.cookies[STATE_COOKIE_NAME].authCodeRequest,
      codeVerifier: req.cookies[STATE_COOKIE_NAME].pkceCodes.verifier,
      code: req.body.code,
    }

    try {
      const msalInstance = this.getMsalInstance()
      const tokenResponse = await msalInstance.acquireTokenByCode(
        authCodeRequest,
        req.body,
      )

      req.session.tokenCache = msalInstance.getTokenCache().serialize()
      req.session.accessToken = tokenResponse.accessToken
      req.session.idToken = tokenResponse.idToken
      req.session.account = tokenResponse.account
      req.session.isAuthenticated = true

      const { redirectTo } = JSON.parse(
        this.cryptoProvider.base64Decode(req.body.state),
      )

      res.clearCookie(STATE_COOKIE_NAME, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      }) // discard the state cookie

      // check if the user exists
      const decodedToken: jwt.JwtPayload = jwt.decode(
        tokenResponse.accessToken,
        { complete: true },
      ).payload as jwt.JwtPayload
      let user = await userService.getUserByExternalId(decodedToken.oid)
      if (!user) {
        // create the user
        const {
          isExternal = true,
          firstName = decodedToken.given_name,
          lastName = decodedToken.family_name,
          nickName = decodedToken.name,
          email = decodedToken.upn,
          externalId = decodedToken.oid,
          tenantId = decodedToken.tid,
        } = decodedToken
        const baseUser: BaseUser = {
          isExternal,
          firstName,
          lastName,
          nickName,
          email,
          externalId,
          tenantId,
        }

        user = await userService.createUser(baseUser)
      }
      // update the user info in the session account
      req.session.account.user = {
        id: user.id.toString(),
        name: user.nickName,
        isCloudConnected: user.cloudConnections?.azure?.connected || false,
      }
      req.session.accessTokenToCloud = user.cloudConnections?.azure?.accessToken
      res.redirect(redirectTo)
    } catch (error) {
      next(error)
    }
  }

  async connect(req, res, next, options = {} as any) {
    /**
     * MSAL Node allows you to pass your custom state as state parameter in the Request object.
     * The state parameter can also be used to encode information of the app's state before redirect.
     * You can pass the user's state in the app, such as the page or view they were on, as input to this parameter.
     */
    const state = this.cryptoProvider.base64Encode(
      JSON.stringify({
        csrfToken: this.cryptoProvider.createNewGuid(), // create a GUID for csrf
        redirectTo: options.postConnectRedirectUri
          ? options.postConnectRedirectUri
          : this.config.postConnectRedirectUri
          ? this.config.postConnectRedirectUri
          : '/',
      }),
    )

    const authCodeUrlRequestParams = {
      state: state,
      /**
       * By default, MSAL Node will add OIDC scopes to the auth code url request. For more information, visit:
       * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
       */
      scopes: options.scopesToConsent ? options.scopesToConsent.split(' ') : [],
      claims: getClaims(
        req.session,
        this.config.msalConfig.auth.clientId,
        AZURE_SERVICES_ENDPOINT,
      ),
    }

    const authCodeRequestParams = {
      state: state,
      /**
       * By default, MSAL Node will add OIDC scopes to the auth code request. For more information, visit:
       * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
       */
      scopes: options.scopesToConsent ? options.scopesToConsent.split(' ') : [],
      claims: getClaims(
        req.session,
        this.config.msalConfig.auth.clientId,
        AZURE_SERVICES_ENDPOINT,
      ),
    }

    /**
     * If the current msal configuration does not have cloudDiscoveryMetadata or authorityMetadata, we will
     * make a request to the relevant endpoints to retrieve the metadata. This allows MSAL to avoid making
     * metadata discovery calls, thereby improving performance of token acquisition process.
     */
    if (
      !this.config.msalConfig.auth.cloudDiscoveryMetadata ||
      !this.config.msalConfig.auth.authorityMetadata
    ) {
      const [cloudDiscoveryMetadata, authorityMetadata] = await Promise.all([
        this.getCloudDiscoveryMetadata(),
        this.getAuthorityMetadata(),
      ])

      this.config.msalConfig.auth.cloudDiscoveryMetadata = JSON.stringify(
        cloudDiscoveryMetadata,
      )
      this.config.msalConfig.auth.authorityMetadata =
        JSON.stringify(authorityMetadata)
    }

    const msalInstance = this.getMsalInstance()

    return this.redirectToAuthCodeUrlForConnect(
      req,
      res,
      next,
      authCodeUrlRequestParams,
      authCodeRequestParams,
      msalInstance,
    )
  }

  async redirectToAuthCodeUrlForConnect(
    req,
    res,
    next,
    authCodeUrlRequestParams,
    authCodeRequestParams,
    msalInstance,
  ) {
    const { verifier, challenge } =
      await this.cryptoProvider.generatePkceCodes()

    const authCodeUrlRequest = {
      redirectUri: this.config.redirectConnectUri,
      responseMode: ResponseMode.FORM_POST, // recommended for confidential clients
      codeChallenge: challenge,
      codeChallengeMethod: 'S256',
      ...authCodeUrlRequestParams,
    }

    const cookiePayload = {
      pkceCodes: {
        verifier: verifier,
      },
      authCodeRequest: {
        redirectUri: this.config.redirectConnectUri,
        ...authCodeRequestParams,
      },
    }

    try {
      const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(
        authCodeUrlRequest,
      )

      /**
       * Web apps using OIDC form_post flow for authentication rely on cross-domain
       * cookies for security. Here we designate the cookie with sameSite=none to ensure we can retrieve
       * state after redirect from the Azure AD takes place. For more information, visit:
       * https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-handle-samesite-cookie-changes-chrome-browser
       */
      res.cookie(CONNECT_STATE_COOKIE_NAME, cookiePayload, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      res.json({ authUrl: authCodeUrlResponse })
    } catch (error) {
      next(error)
    }
  }

  async handleRedirectToConnect(req, res, next) {
    const authCodeRequest = {
      ...req.cookies[CONNECT_STATE_COOKIE_NAME].authCodeRequest,
      codeVerifier: req.cookies[CONNECT_STATE_COOKIE_NAME].pkceCodes.verifier,
      code: req.body.code,
    }

    try {
      const msalInstance = this.getMsalInstance()
      const tokenResponse = await msalInstance.acquireTokenByCode(
        authCodeRequest,
        req.body,
      )

      if (!req.session.account) {
        req.session.accessToken = tokenResponse.accessToken
        req.session.account = tokenResponse.account
        req.session.isAuthenticated = true
      }
      req.session.accessTokenToCloud = tokenResponse.accessToken

      const decodedToken: jwt.JwtPayload = jwt.decode(
        tokenResponse.accessToken,
        { complete: true },
      ).payload as jwt.JwtPayload
      // update the user info in the session account
      const user: any = await userService.getUserByExternalId(decodedToken.oid)
      if (user) {
        if (!user.cloudConnections) {
          user.cloudConnections = {}
        }
        user.cloudConnections.azure = {
          connected: true,
          scopes: decodedToken.scp.split(' '),
          account: tokenResponse.account,
          code: req.body.code,
          accessToken: tokenResponse.accessToken,
        }
        await userService.updateUser(user.id, user)
      }
      req.session.account.user = {
        id: user.id.toString(),
        name: user.nickName,
        isCloudConnected: true,
      }

      const { redirectTo } = JSON.parse(
        this.cryptoProvider.base64Decode(req.body.state),
      )

      res.clearCookie(CONNECT_STATE_COOKIE_NAME, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      }) // discard the state cookie
      res.redirect(redirectTo)
    } catch (error) {
      next(error)
    }
  }

  async logout(req, res, next) {
    /**
     * Construct a logout URI and redirect the user to end the
     * session with Azure AD. For more information, visit:
     * https://docs.microsoft.com/azure/active-directory/develop/v2-protocols-oidc#send-a-sign-out-request
     */
    const logoutUri = `${this.config.msalConfig.auth.authority}/oauth2/v2.0/logout?post_logout_redirect_uri=${this.config.postLogoutRedirectUri}`

    req.session.destroy(() => {
      res.clearCookie(SESSION_COOKIE_NAME)
      res.json({ authUrl: logoutUri })
    })
  }

  async acquireToken(req, res, next, options = {} as any) {
    const msalInstance = this.getMsalInstance()

    try {
      msalInstance.getTokenCache().deserialize(req.session.tokenCache)

      const tokenResponse = await msalInstance.acquireTokenSilent({
        account: req.session.account,
        scopes: options.scopes || [],
        claims: getClaims(
          req.session,
          this.config.msalConfig.auth.clientId,
          GRAPH_ME_ENDPOINT,
        ),
      })

      req.session.tokenCache = msalInstance.getTokenCache().serialize()
      req.session.accessToken = tokenResponse.accessToken
      req.session.idToken = tokenResponse.idToken
      req.session.account = tokenResponse.account

      return tokenResponse
    } catch (error) {
      class CustomError extends Error {
        payload: string
      }

      if (error instanceof InteractionRequiredAuthError) {
        const err = new CustomError(
          'InteractionRequiredAuthError occurred for given scopes',
        )
        err.payload = options.scopes.join(' ')
        err.name = 'InteractionRequiredAuthError'
        throw err
      } else {
        throw error
      }
    }
  }

  async acquireTokenForConsumptionMgmt(req, res, next, options = {} as any) {
    const msalInstance = this.getMsalInstance()

    try {
      msalInstance.getTokenCache().deserialize(req.session.tokenCache)
      const acquireTokenRequest = {
        account: req.session.account,
        scopes: options.scopes || [],
        claims: getClaims(
          req.session,
          this.config.msalConfig.auth.clientId,
          AZURE_SERVICES_ENDPOINT,
        ),
      }
      const tokenResponse = await msalInstance.acquireTokenSilent(
        acquireTokenRequest,
      )

      return tokenResponse
    } catch (error) {
      class CustomError extends Error {
        payload: string
      }

      if (error instanceof InteractionRequiredAuthError) {
        const err = new CustomError(
          'InteractionRequiredAuthError occurred for given scopes',
        )
        err.payload = options.scopes.join(' ')
        err.name = 'InteractionRequiredAuthError'
        // update the user info in the session account
        req.session.account.user.isCloudConnected = false
        const userId = req.session?.account?.user?.id
        const user: any = await userService.getUserById(userId)
        if (user && user.cloudConnections && user.cloudConnections.azure) {
          user.cloudConnections.azure = {
            connected: false, // disconnect the user
          }
          await userService.updateUser(user.id, user)
        }
        throw err
      } else {
        throw error
      }
    }
  }

  isAuthenticated(req, res, next) {
    if (req.session && req.session.isAuthenticated) {
      return true
    }

    return false
  }

  getAccount(req, res, next) {
    if (this.isAuthenticated(req, res, next)) {
      return req.session.account
    }

    return null
  }

  /**
   * Retrieves cloud discovery metadata from the /discovery/instance endpoint
   * @returns
   */
  async getCloudDiscoveryMetadata() {
    const endpoint =
      'https://login.microsoftonline.com/common/discovery/instance'

    try {
      const response = await axios.get(endpoint, {
        params: {
          'api-version': '1.1',
          authorization_endpoint: `${this.config.msalConfig.auth.authority}/oauth2/v2.0/authorize`,
        },
      })

      return await response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Retrieves oidc metadata from the openid endpoint
   * @returns
   */
  async getAuthorityMetadata() {
    const endpoint = `${this.config.msalConfig.auth.authority}/v2.0/.well-known/openid-configuration`

    try {
      const response = await axios.get(endpoint)
      return await response.data
    } catch (error) {
      throw error
    }
  }
}

export const authProvider = new AuthProvider({
  msalConfig: msalConfig,
  redirectUri: REDIRECT_URI,
  redirectConnectUri: REDIRECT_CONNECT_URI,
  postLoginRedirectUri: POST_LOGIN_REDIRECT_URI,
  postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI,
  postConnectRedirectUri: POST_CONNECT_REDIRECT_URI,
})
