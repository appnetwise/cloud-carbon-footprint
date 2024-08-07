/**
 * Required External Modules and Interfaces
 */

import express from 'express'
import { auth } from '../utils/keycloak.auth'
import { userController } from './user.controller'

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
export const userRouter = express.Router()
userRouter.use(auth)

/**
 * @openapi
 * paths:
 *  /api/users/{id}:
 *      get:
 *          summary: Returns the user data with the given ID
 *          description: Returns the user data with the given ID
 *          tags: [Users]
 *          security:
 *          - bearerAuth: []
 *          produces:
 *          - application/json
 *          parameters:
 *          -   in: path
 *              name: id
 *              required: true
 *              description: ID of the user to get
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
userRouter.get('/:id', userController.getUserById)

/**
 * @openapi
 * paths:
 *  /api/users/{id}:
 *      get:
 *          summary: Returns the user data with the given ID
 *          description: Returns the user data with the given ID
 *          tags: [Users]
 *          security:
 *          - bearerAuth: []
 *          produces:
 *          - application/json
 *          parameters:
 *          -   in: path
 *              name: id
 *              required: true
 *              description: ID of the user to get
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
userRouter.get('/:id/profile', userController.getUserProfileById)

/**
 * @openapi
 * paths:
 *  /api/users/{id}:
 *      get:
 *          summary: Returns the user data with the given ID
 *          description: Returns the user data with the given ID
 *          tags: [Users]
 *          security:
 *          - bearerAuth: []
 *          produces:
 *          - application/json
 *          parameters:
 *          -   in: path
 *              name: id
 *              required: true
 *              description: ID of the user to get
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
userRouter.get(
  '/:id/cloud-connect-info',
  userController.getUserCloudConnectionInfoById,
)

/**
 * @openapi
 * paths:
 *  /api/users/external/{externalId}:
 *      get:
 *          summary: Returns the user data with the given external ID
 *          description: Returns the user data with the given external ID
 *          tags: [Users]
 *          security:
 *          - bearerAuth: []
 *          produces:
 *          - application/json
 *          parameters:
 *          -   in: path
 *              name: externalId
 *              required: true
 *              description: External ID of the user to get
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
userRouter.get('/external/:externalId', userController.getUserByExternalId)

/**
 * @openapi
 * paths:
 *  /api/users/external/{externalId}/exists:
 *      get:
 *          summary: Returns true/false if the user exists with the given external ID
 *          description: Returns true/false if the user exists with the given external ID
 *          tags: [Users]
 *          security:
 *          - bearerAuth: []
 *          produces:
 *          - application/json
 *          parameters:
 *          -   in: path
 *              name: externalId
 *              required: true
 *              description: External ID of the user to get
 *      responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       500:
 *        description: Internal Server Error
 */
userRouter.get(
  '/external/:externalId/exists',
  userController.checkUserExistsByExternalId,
)

/**
 * @openapi
 * paths:
 *  /api/users/:
 *      post:
 *          summary: Creates the user
 *          description: Creates the user with the given information
 *          tags: [Users]
 *          security:
 *          - bearerAuth: []
 *          produces:
 *          - application/json
 *          consumes:
 *          - application/json
 *          parameters:
 *          -   in: body
 *              name: User
 *              required: true
 *              description: User JSON
 *      responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       500:
 *        description: Internal Server Error
 */
userRouter.post('/', userController.createUser)

/**
 * @openapi
 * paths:
 *  /api/users/{id}:
 *      put:
 *          summary: Updates the user
 *          description: Updates the user with the given information
 *          tags: [Users]
 *          security:
 *          - bearerAuth: []
 *          produces:
 *          - application/json
 *          consumes:
 *          - application/json
 *          parameters:
 *          -   in: path
 *              name: id
 *              required: true
 *              description: ID of the user to update
 *          -   in: body
 *              name: User
 *              required: true
 *              description: User JSON
 *      responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       500:
 *        description: Internal Server Error
 */
userRouter.put('/:id', userController.updateUser)

/**
 * @openapi
 * paths:
 *  /api/users/{id}:
 *      delete:
 *          summary: Deletes the user
 *          description: Deletes the user with the given ID
 *          tags: [Users]
 *          security:
 *          - bearerAuth: []
 *          produces:
 *          - application/json
 *          parameters:
 *          -   in: path
 *              name: id
 *              required: true
 *              description: ID of the user to delete
 *      responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       500:
 *        description: Internal Server Error
 */
userRouter.delete('/:id', userController.removeUser)
