import getGraphClient from '../utils/graphClient'
import {
  msalConfig,
  REDIRECT_URI,
  POST_LOGIN_REDIRECT_URI,
  POST_LOGOUT_REDIRECT_URI,
  GRAPH_ME_ENDPOINT,
  AZURE_SERVICES_ENDPOINT,
} from '../authConfig'

import AuthProvider from './auth.provider'
import { ResponseType } from '@microsoft/microsoft-graph-client'
import { handleAnyClaimsChallenge, setClaims } from '../utils/claimUtils'
const authProvider = new AuthProvider({
  msalConfig: msalConfig,
  redirectUri: REDIRECT_URI,
  postLoginRedirectUri: POST_LOGIN_REDIRECT_URI,
  postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI,
})

class AuthController {
  constructor() {}

  public async loginUser(req, res, next) {
    let postLoginRedirectUri
    let scopesToConsent

    if (req.query && req.query.postLoginRedirectUri) {
      postLoginRedirectUri = decodeURIComponent(req.query.postLoginRedirectUri)
    }

    if (req.query && req.query.scopesToConsent) {
      scopesToConsent = decodeURIComponent(req.query.scopesToConsent)
    }

    return authProvider.login(req, res, next, {
      postLoginRedirectUri,
      scopesToConsent,
    })
  }

  public async handleRedirect(req, res, next) {
    return authProvider.handleRedirect(req, res, next)
  }

  public async logoutUser(req, res, next) {
    return authProvider.logout(req, res, next)
  }

  public async getAccount(req, res, next) {
    const account = authProvider.getAccount(req, res, next)
    res.status(200).json(account)
  }

  public async getProfile(req, res, next) {
    if (!authProvider.isAuthenticated(req, res, next)) {
      return res.status(401).json({ error: 'unauthorized' })
    }

    try {
      const tokenResponse = await authProvider.acquireToken(req, res, next, {
        scopes: ['User.Read'],
      })
      const graphResponse = await getGraphClient(tokenResponse.accessToken)
        .api('/me')
        .responseType(ResponseType.RAW)
        .get()
      const graphData = await handleAnyClaimsChallenge(graphResponse)

      res.status(200).json(graphData)
    } catch (error) {
      if (error.name === 'ClaimsChallengeAuthError') {
        setClaims(
          req.session,
          msalConfig.auth.clientId,
          GRAPH_ME_ENDPOINT,
          error.payload,
        )
        return res.status(401).json({ error: error.name })
      }

      if (error.name === 'InteractionRequiredAuthError') {
        return res
          .status(401)
          .json({ error: error.name, scopes: error.payload })
      }

      next(error)
    }
  }

  public async connectCloud(req, res, next) {
    if (!authProvider.isAuthenticated(req, res, next)) {
      return res.status(401).json({ error: 'unauthorized' })
    }

    try {
      const tokenResponse = await authProvider.acquireTokenForConsumptionMgmt(
        req,
        res,
        next,
        {
          scopes: ['user_impersonation'],
        },
      )

      // const user = await userService.getUserByExternalId(req.session.account.user.id)
      
      res.status(200).json({ msg: 'Connected to cloud', tokenResponse })
    } catch (error) {
      if (error.name === 'ClaimsChallengeAuthError') {
        setClaims(
          req.session,
          msalConfig.auth.clientId,
          AZURE_SERVICES_ENDPOINT,
          error.payload,
        )
        return res.status(401).json({ error: error.name })
      }

      if (error.name === 'InteractionRequiredAuthError') {
        return res
          .status(401)
          .json({ error: error.name, scopes: error.payload })
      }

      next(error)
    }
  }
}

export const authController = new AuthController()
