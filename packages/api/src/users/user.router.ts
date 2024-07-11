/**
 * Required External Modules and Interfaces
 */

import express, { Request, Response } from 'express'
import * as userService from './user.service'
import { BaseUser, User } from './user'
import { authSession } from '../utils/auth'
import { UserEntity } from './entity/user.entity'

const jwt = require('jsonwebtoken')

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
userRouter.use(authSession)
// userRouter.use(auth)

/**
 * @openapi
 * paths:
 *  /api/users/:
 *      get:
 *          summary: Returns all users
 *          description: Returns all users
 *          tags: [Users]
 *          security:
 *          - bearerAuth: []
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
userRouter.get('/', async (req: Request, res: Response) => {
  try {
    const users: UserEntity[] = await userService.getAllUsers()
    return res.status(200).send(users)
  } catch (e) {
    return res.status(500).send(e.message)
  }
})

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
userRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id: string = req.params.id
    const user: UserEntity = await userService.getUserById(id)
    return user
      ? res.status(200).send(user)
      : res.status(404).send('user not found')
  } catch (e) {
    return res.status(500).send(e.message)
  }
})

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
userRouter.get('/external/:externalId', async (req: Request, res: Response) => {
  try {
    const externalId: string = req.params.externalId
    const user: UserEntity = await userService.getUserByExternalId(externalId)
    return user
      ? res.status(200).send(user)
      : res.status(404).send('user not found')
  } catch (e) {
    return res.status(500).send(e.message)
  }
})

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
  async (req: Request, res: Response) => {
    try {
      const externalId: string = req.params.externalId
      const user: UserEntity = await userService.getUserByExternalId(externalId)
      return user && user.externalId === externalId
        ? res.status(200).send(true)
        : res.status(200).send(false)
    } catch (e) {
      return res.status(500).send(e.message)
    }
  },
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
userRouter.post('/', async (req: Request, res: Response) => {
  try {
    let user: BaseUser = req.body
    const token = req.headers.authorization?.split(' ')[1]
    if (token) {
      user.tenantId = jwt.decode(token).tid
    }
    const newUser = await userService.createUser(user)
    return res.status(201).json(newUser)
  } catch (e) {
    return res.status(500).send(e.message)
  }
})

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
userRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id: string = req.params.id
    const userUpdate: User = req.body
    const updatedUser: UserEntity = await userService.updateUser(id, userUpdate)
    return updatedUser
      ? res.status(200).json('User updated successfully')
      : res.status(404).send('User not found')
  } catch (e) {
    return res.status(500).send(e.message)
  }
})

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
userRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id: string = req.params.id
    const isUserRemoved = await userService.removeUser(id)
    return isUserRemoved
      ? res.status(200).send('User deleted successfully')
      : res.status(404).send('User not found')
  } catch (e) {
    return res.status(500).send(e.message)
  }
})
