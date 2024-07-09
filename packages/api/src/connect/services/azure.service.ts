import { ConfidentialClientApplication } from '@azure/msal-node'
import * as userService from '../../users/user.service'

export class AzureService {
  private msalClient: ConfidentialClientApplication

  constructor() {
    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: process.env.MSAL_CLIENT_ID!,
        clientSecret: process.env.MSAL_SECRET!,
        authority: process.env.MSAL_AUTHORITY!,
      },
    })
  }Q

  async getTokenForUser(userId: string): Promise<string> {
    const user = await userService.getUserById(userId)

    if (!user || !user.cloudConnections.azure.connected) {
      throw new Error('User not connected to Azure')
    }

    try {
      const result: any = await this.msalClient.acquireTokenByRefreshToken({
        scopes: user.cloudConnections.azure.scopes,
        refreshToken: user.cloudConnections.azure.refreshToken,
      })
      const result2: any = await this.msalClient.acquireTokenByCode({
        scopes: user.cloudConnections.azure.scopes,
        code: user.cloudConnections.azure.code,
        redirectUri: process.env.MSAL_REDIRECT_URI!,
      })


      if (result.accessToken) {
        // Update the refresh token if a new one was issued
        if (result.refreshToken) {
          user.cloudConnections.azure.refreshToken = result.refreshToken
          user.cloudConnections.azure.refreshTokenExpires = new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000,
          ) // 14 days
          await userService.updateUser(userId, user)
        }
        return result.accessToken
      } else {
        throw new Error('Failed to acquire token')
      }
    } catch (error) {
      console.error('Error acquiring token:', error)
      // If refresh token is invalid, we need to prompt the user to reconnect
      user.cloudConnections.azure.connected = false
      await userService.updateUser(userId, user)
      throw new Error('Azure connection expired. Please reconnect.')
    }
  }
}
