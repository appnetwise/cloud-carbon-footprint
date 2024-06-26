/**
 * Required External Modules and Interfaces
 */

import express, { Request, Response } from 'express'
import * as userService from './user.service'
import { BaseUser, User } from './user'
import auth from '../utils/auth'

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
userRouter.use(auth)

/**
 * @openapi
 * paths:
 *  /api/users/{id}:
 *      get:
 *          summary: Returns the user profile data
 *          description: Returns the user profile data
 *          tags: [User Profile]    
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
  const id: string = req.params.id

  try {
    const user: User = await userService.find(id)

    if (user) {
      return res.status(200).send(user)
    }

    return res.status(404).send('user not found')
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
 *          tags: [User Exists]    
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
userRouter.get('/:externalId/exists', async (req: Request, res: Response) => {
  const externalId: string = req.params.externalId

  try {
    const user: User = await userService.findByExternalId(externalId)

    if (user && user.externalId === externalId) {
      return res.status(200).send(true)
    }

    return res.status(200).send(false)
  } catch (e) {
    return res.status(500).send(e.message)
  }
})

/**
 * @openapi
 * paths:
 *  /api/users/external/{externalId}:
 *      get:
 *          summary: Returns true/false if the user exists with the given external ID
 *          description: Returns true/false if the user exists with the given external ID
 *          tags: [User Exists]    
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
  const externalId: string = req.params.externalId

  try {
    const user: User = await userService.findByExternalId(externalId)

    if (user) {
      return res.status(200).send(user)
    }

    return res.status(404).send('user not found')
  } catch (e) {
    return res.status(500).send(e.message)
  }
})



userRouter.get('/', async (req: Request, res: Response) => {
  try {
    const users: User[] = await userService.findAll()

    res.status(200).send(users)
  } catch (e) {
    res.status(500).send(e.message)
  }
})

// POST users

userRouter.post('/', async (req: Request, res: Response) => {
  try {
    let user: BaseUser = req.body
    const token = req.headers.authorization?.split(' ')[1]
    if (token) {
      user.tenantId = jwt.decode(token).tid
    }
    const newUser = await userService.create(user)

    res.status(201).json(newUser)
  } catch (e) {
    res.status(500).send(e.message)
  }
})

// PUT users/:id

userRouter.put('/:id', async (req: Request, res: Response) => {
  const id: string = req.params.id

  try {
    const userUpdate: User = req.body

    const existingUser: User = await userService.find(id)

    if (existingUser) {
      const updatedUser = await userService.update(id, userUpdate)
      return res.status(200).json(updatedUser)
    }

    const newUser = await userService.create(userUpdate)

    return res.status(201).json(newUser)
  } catch (e) {
    return res.status(500).send(e.message)
  }
})

// DELETE users/:id

userRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id: string = req.params.id
    await userService.remove(id)

    res.sendStatus(204)
  } catch (e) {
    res.status(500).send(e.message)
  }
})