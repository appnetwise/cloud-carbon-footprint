/**
 * Data Model Interfaces
 */

import { randomUUID } from 'crypto'
import { BaseUser, User } from './user'
import { Users } from './users'

const defaultTenantId = '-1'

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

export const create = async (
  newUser: BaseUser,
  tenantId?: string,
): Promise<User> => {
  const id = randomUUID()
  const date = new Date()
  newUser.createdAt = date
  newUser.updatedAt = date

  if (!tenantId) {
    // leverage the default tenantId if not provided
    tenantId = defaultTenantId
  }
  users[id] = {
    id,
    tenantId,
    ...newUser,
  }

  return users[id]
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

export const remove = async (id: string): Promise<null | void> => {
  const user = await find(id)

  if (!user) {
    return null
  }

  delete users[id]
}
