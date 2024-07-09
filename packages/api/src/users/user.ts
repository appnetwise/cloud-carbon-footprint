export interface BaseUser {
  email: string
  firstName: string
  isExternal: boolean
  lastName?: string
  nickName?: string
  tenantId?: string
  externalId?: string
  createdAt?: Date
  updatedAt?: Date
  cloudConnections?: any //TODO: Define cloudConnections type
}

export interface User extends BaseUser {
  id: string
  token?: string
}
