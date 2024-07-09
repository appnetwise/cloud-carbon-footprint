import express from 'express'
import { authController } from './auth.controller'

export const authRouter = () => {
  const router = express.Router()

  /**
   * @openapi
   * paths:
   *  /api/auth/login:
   *      get:
   *          summary: login the user
   *          description: login the user
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
   *       500:
   *        description: Internal Server Error
   */
  router.get('/login', authController.loginUser)

  /**
   * @openapi
   * paths:
   *  /api/auth/logout:
   *      get:
   *          summary: logout the user
   *          description: logout the user
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
  router.get('/logout', authController.logoutUser)

  /**
   * @openapi
   * paths:
   *  /api/auth/redirect:
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
  router.post('/redirect', authController.handleRedirect)

  /**
   * @openapi
   * paths:
   *  /api/auth/account:
   *      get:
   *          summary: get the user account
   *          description: get the user account
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
  router.get('/account', authController.getAccount)

  /**
   * @openapi
   * paths:
   *  /api/auth/profile:
   *      get:
   *          summary: get the user profile
   *          description: get the user profile
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
  router.get('/profile', authController.getProfile)
  return router
}
