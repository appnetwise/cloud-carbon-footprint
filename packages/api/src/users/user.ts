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
}

export interface User extends BaseUser {    
    id: string
}