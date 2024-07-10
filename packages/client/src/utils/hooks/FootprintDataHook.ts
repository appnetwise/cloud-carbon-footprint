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
  const { isAuthenticated } = useAuth()
  const { data, error, loading } = useRemoteFootprintService(
    params,
    enabled && isAuthenticated,
  )

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
