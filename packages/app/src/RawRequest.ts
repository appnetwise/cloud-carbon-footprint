/*
 * © 2021 Thoughtworks, Inc.
 */

export interface FootprintEstimatesRawRequest {
  startDate?: string
  endDate?: string
  cloudProviderToSeed?: string
  ignoreCache?: string
  groupBy?: string
  limit?: string
  skip?: string
  cloudProviders?: string[]
  accounts?: string[]
  services?: string[]
  regions?: string[]
  tags?: Tags
  tenantId?: string
  accessToken?: string
}

export interface RecommendationsRawRequest {
  awsRecommendationTarget?: string
  accounts?: string[]
  tenantId?: string
  accessToken?: string 
}

export interface Tags {
  [key: string]: string
}
