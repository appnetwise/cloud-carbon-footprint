import { useEffect } from 'react'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { FilterResultResponse } from '../../Types'
import { EmissionsFilters } from '../../pages/EmissionsMetricsPage/EmissionsFilterBar/utils/EmissionsFilters'
import useRemoteFootprintService, {
  UseRemoteFootprintServiceParams,
} from './FootprintServiceHook'
import { useAuth } from 'src/auth/AuthContext'

export interface FootprintData {
  data: EstimationResult[]
  error: Error | null
  loading: boolean
}

export const useFootprintData = (
  params: UseRemoteFootprintServiceParams,
  enabled: boolean,
): FootprintData => {
  const { isAuthenticated, isFirstVisit, setIsFirstVisit } = useAuth()

  const { data, error, loading } = useRemoteFootprintService(
    params,
    enabled && isAuthenticated && isFirstVisit,
  )

  useEffect(() => {
    if (isAuthenticated && isFirstVisit && enabled && data.length > 0) {
      setIsFirstVisit(false) // Set the flag to false after the first successful call
    }
  }, [isAuthenticated, isFirstVisit, data.length > 0, enabled, setIsFirstVisit])

  return {
    data,
    error,
    loading,
  }
}

export const buildFilters = (filteredResponse: FilterResultResponse) => {
  const updatedConfig = EmissionsFilters.generateConfig(filteredResponse)
  return new EmissionsFilters(updatedConfig)
}
