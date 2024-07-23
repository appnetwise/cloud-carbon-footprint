import { UserEntity } from './entity/user.entity'
import { BaseUser, User } from './user'
import * as userService from './user.service'
import jwt from 'jsonwebtoken'

class UserController {
  public async getAllUsers(req, res) {
    try {
      const users: UserEntity[] = await userService.getAllUsers()
      return res.status(200).send(users)
    } catch (e) {
      return res.status(500).send('Error retrieving users')
    }
  }

  public async getUserById(req, res) {
    try {
      const id: string = req.params.id
      const user: UserEntity = await userService.getUserById(id)
      return user
        ? res.status(200).send(user)
        : res.status(404).send('user not found')
    } catch (e) {
      return res.status(500).send('Error retrieving user')
    }
  }

  public async createUser(req, res) {
    try {
      const user: BaseUser = req.body
      const token = req.headers.authorization?.split(' ')[1]
      if (token) {
        const decodedToken = jwt.decode(token)
        if (
          decodedToken &&
          typeof decodedToken === 'object' &&
          'tid' in decodedToken
        ) {
          user.tenantId = decodedToken.tid
        } else {
          throw new Error('Tenant ID (tid) not found in token')
        }
      }
      const newUser = await userService.createUser(user)
      return res.status(201).json(newUser)
    } catch (e) {
      return res.status(500).send('Create user failed. Internal server error')
    }
  }

  public async updateUser(req, res) {
    try {
      const id: string = req.params.id
      const userUpdate: User = req.body
      const updatedUser: UserEntity = await userService.updateUser(
        id,
        userUpdate,
      )
      return updatedUser
        ? res.status(200).json('User updated successfully')
        : res.status(404).send('User not found')
    } catch (e) {
      return res.status(500).send('Update user failed. Internal server error')
    }
  }

  public async removeUser(req, res) {
    try {
      const id: string = req.params.id
      const isUserRemoved = await userService.removeUser(id)
      return isUserRemoved
        ? res.status(200).send('User deleted successfully')
        : res.status(404).send('User not found')
    } catch (e) {
      return res.status(500).send('Delete user failed. Internal server error')
    }
  }
}
export const userController = new UserController()
