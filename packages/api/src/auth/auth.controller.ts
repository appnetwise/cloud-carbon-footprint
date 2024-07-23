import { msalConfig, AZURE_SERVICES_ENDPOINT } from '../authConfig'
import { authProvider } from './auth.provider'
import { setClaims } from '../utils/claimUtils'

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

    return await authProvider.login(req, res, next, {
      postLoginRedirectUri,
      scopesToConsent,
    })
  }

  public async handleRedirect(req, res, next) {
    return authProvider.handleRedirect(req, res, next)
  }

  public async handleRedirectToConnect(req, res, next) {
    return authProvider.handleRedirectToConnect(req, res, next)
  }

  public async logoutUser(req, res, next) {
    return authProvider.logout(req, res, next)
  }

  public async getAccount(req, res, next) {
    const account = authProvider.getAccount(req, res, next)
    res.status(200).json(account)
  }

  public async connectCloud(req, res, next) {
    if (!authProvider.isAuthenticated(req, res, next)) {
      return res.status(401).json({ error: 'unauthorized' })
    }

    try {
      let postLoginRedirectUri
      let scopesToConsent

      if (req.query && req.query.postLoginRedirectUri) {
        postLoginRedirectUri = decodeURIComponent(
          req.query.postLoginRedirectUri,
        )
      }

      if (req.query && req.query.scopesToConsent) {
        scopesToConsent = decodeURIComponent(req.query.scopesToConsent)
      }
      if (!scopesToConsent) {
        // space separated list of scopes
        scopesToConsent = AZURE_SERVICES_ENDPOINT
      }
      return await authProvider.connect(req, res, next, {
        scopesToConsent,
      })
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
