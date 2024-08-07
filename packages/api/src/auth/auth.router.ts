import express from 'express'
import { authController } from './auth.controller'
import { auth } from '../utils/keycloak.auth'

export const authRouter = () => {
  const router = express.Router()

  /**
   * @openapi
   * paths:
   *  /api/auth/redirect-connect:
   *      post:
   *          summary: redirect the user
   *          description: redirect the user
   *          tags: [Auth]
   *          produces:
   *          - application/json
   *      responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *            schema:
   *              type: object
   *              items:
   *                $ref: '#/components/schemas/UserResponse'
   *       401:
   *         description: Unauthorized
   *       500:
   *        description: Internal Server Error
   */
  router.post('/redirect-connect', authController.handleRedirectToConnect)

  /**
   * @openapi
   * paths:
   *  /api/auth/connect:
   *      get:
   *          summary: connect to the cloud
   *          description: connect to the cloud
   *          tags: [Auth]
   *          produces:
   *          - application/json
   *      responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *            schema:
   *              type: object
   *              items:
   *                $ref: '#/components/schemas/UserResponse'
   *       401:
   *         description: Unauthorized
   *       500:
   *        description: Internal Server Error
   */
  router.get('/connect', auth, authController.connectCloud)

  return router
}
