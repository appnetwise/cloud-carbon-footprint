/**
 * Data Model Interfaces
 */
import { BaseUser } from './user'
import { AppDataSource } from '../data-source'
import { UserEntity } from './entity/user.entity'
import { Logger } from '@cloud-carbon-footprint/common'
import { ObjectId } from 'mongodb'

const defaultTenantId = '-1'
const userServiceLogger = new Logger('UserService')

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
