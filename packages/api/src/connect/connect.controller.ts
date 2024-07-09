import { Request, Response } from 'express'
import { AzureService } from './services/azure.service'
import * as userService from '../users/user.service'
import { JwtPayload } from 'jsonwebtoken'

export class ConnectController {
  private azureService: AzureService

  constructor() {
    this.azureService = new AzureService()
  }

  async connectAzure(req: Request, res: Response) {
    const { token } = req.body
    const userId = (req.user as any).id // Assuming you have authentication middleware

    try {
      const decodedToken: any= await this.azureService.getTokenForUser(token)

      const user = await userService.getUserById(userId)

      if (user) {
        user.cloudConnections.azure = {
          connected: true,
          scopes: decodedToken.scopes,
          refreshToken: decodedToken.refreshToken,
          refreshTokenExpires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        }
        await userService.updateUser(userId, user)
      }

      res.status(200).json({ message: 'Successfully connected to Azure' })
    } catch (error) {
      console.error('Error connecting to Azure:', error)
      res.status(500).json({ error: 'Failed to connect to Azure' })
    }
  }

  // ... similar methods for AWS and GCP ...
}
