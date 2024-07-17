/**
 * Data Model Interfaces
 */

import { randomUUID } from 'crypto'
import { BaseUser, User } from './user'
import { Users } from './users'
import { AppDataSource } from '../data-source'
import { UserEntity } from './entity/user.entity'
import { Logger } from '@cloud-carbon-footprint/common'
import { ObjectId } from 'mongodb'

const defaultTenantId = '-1'
const userServiceLogger = new Logger('UserService')

/**
 * In-Memory Store
 */

let users: Users = {
  '1': {
    id: '1',
    tenantId: 't1',
    nickName: 'User 1',
    firstName: 'User',
    lastName: 'One',
    email: 'user1@email.com',
    isExternal: true,
    externalId: '123',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  '2': {
    id: '2',
    tenantId: 't2',
    firstName: 'User',
    isExternal: true,
    externalId: '456',
    lastName: 'Two',
    nickName: 'User 2',
    email: 'user2@email.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
}

export const findAll = async (): Promise<User[]> => Object.values(users)

export const find = async (id: string): Promise<User> => users[id]
export const findByExternalId = async (
  externalId: string,
): Promise<User> | null => {
  for (const user of Object.values(users)) {
    if (user.externalId === externalId) {
      return user
    }
  }
  return null
}

export const getAllUsers = async (): Promise<UserEntity[]> => {
  try {
    const userRepository = AppDataSource.getRepository(UserEntity)
    const users = await userRepository.find()
    return users
  } catch (e) {
    userServiceLogger.error('error getting users', e)
    throw e
  }
}

export const getUserById = async (id: string): Promise<UserEntity> => {
  try {
    const userRepository = AppDataSource.getRepository(UserEntity)
    const user = await userRepository.findOneById(new ObjectId(id))
    return user
  } catch (e) {
    userServiceLogger.error('error getting user', e)
    throw e
  }
}

export const getUserByExternalId = async (
  externalId: string,
): Promise<UserEntity> => {
  try {
    const userRepository = AppDataSource.getRepository(UserEntity)
    const user = await userRepository.findOne({
      where: { externalId: externalId },
    })
    return user
  } catch (e) {
    userServiceLogger.error('error getting user', e)
    throw e
  }
}

export const create = async (newUser: BaseUser): Promise<User> => {
  const id = randomUUID()
  const date = new Date()
  newUser.createdAt = date
  newUser.updatedAt = date
  if (!newUser.tenantId) {
    // leverage the default tenantId if not provided
    newUser.tenantId = defaultTenantId
  }
  users[id] = {
    id,
    ...newUser,
  }

  return users[id]
}

export const createUser = async (newUser: BaseUser): Promise<UserEntity> => {
  try {
    if (!newUser.tenantId) {
      // leverage the default tenantId if not provided
      newUser.tenantId = defaultTenantId
    }

    const userEntity = new UserEntity()
    userEntity.lastName = newUser.lastName
    userEntity.firstName = newUser.firstName
    userEntity.email = newUser.email
    userEntity.nickName = newUser.nickName
    userEntity.isExternal = newUser.isExternal
    userEntity.tenantId = newUser.tenantId
    userEntity.externalId = newUser.externalId

    const userRepository = AppDataSource.getRepository(UserEntity)
    // userRepository.create(userEntity)
    await userRepository.save(userEntity)

    return { id: userEntity.id, ...newUser }
  } catch (e) {
    userServiceLogger.error('error saving user', e)
    throw e
  }
}

export const update = async (
  id: string,
  userUpdate: BaseUser,
): Promise<User | null> => {
  const existingUser = await find(id)

  if (!existingUser) {
    return null
  }

  existingUser.updatedAt = new Date()
  if (userUpdate.email) {
    existingUser.email = userUpdate.email
  }
  if (userUpdate.firstName) {
    existingUser.firstName = userUpdate.firstName
  }
  if (userUpdate.lastName) {
    existingUser.lastName = userUpdate.lastName
  }
  if (userUpdate.nickName) {
    existingUser.nickName = userUpdate.nickName
  }
  users[id] = { id, ...existingUser }

  return users[id]
}

export const updateUser = async (
  id: string,
  userUpdate: BaseUser,
): Promise<UserEntity | null> => {
  try {
    const userRepository = AppDataSource.getRepository(UserEntity)
    const user = await userRepository.findOneById(new ObjectId(id))
    if (!user) {
      return null
    }

    if (userUpdate.email) {
      user.email = userUpdate.email
    }
    if (userUpdate.firstName) {
      user.firstName = userUpdate.firstName
    }
    if (userUpdate.lastName) {
      user.lastName = userUpdate.lastName
    }
    if (userUpdate.nickName) {
      user.nickName = userUpdate.nickName
    }
    if (userUpdate.cloudConnections) {
      user.cloudConnections = userUpdate.cloudConnections
    }

    await userRepository.save(user)

    return user
  } catch (e) {
    userServiceLogger.error('error updating user', e)
    throw e
  }
}

export const remove = async (id: string): Promise<null | void> => {
  const user = await find(id)

  if (!user) {
    return null
  }

  delete users[id]
}

export const removeUser = async (id: string): Promise<boolean> => {
  try {
    const userRepository = AppDataSource.getRepository(UserEntity)
    const user = await userRepository.findOneById(new ObjectId(id))
    if (!user) {
      return null
    }
    const userRemoved = await userRepository.remove(user)
    return userRemoved ? true : false
  } catch (e) {
    userServiceLogger.error('error removing user', e)
    throw e
  }
}
