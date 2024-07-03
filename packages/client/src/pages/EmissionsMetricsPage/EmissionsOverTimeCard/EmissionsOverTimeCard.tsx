/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent, ReactElement } from 'react'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import NoDataMessage from '../../../common/NoDataMessage'
import DashboardCard from '../../../layout/DashboardCard'
import ApexLineChart from './ApexLineChart/ApexLineChart'
import ErrorPage from 'src/layout/ErrorPage'

type EmissionsOverTimeProps = {
  data: EstimationResult[]
  error: Error
}

const EmissionsOverTimeCard: FunctionComponent<EmissionsOverTimeProps> = ({
  data,
  error,
}): ReactElement => {
  if (error) {
    return <ErrorPage></ErrorPage>
  }
  return data.length ? (
    <DashboardCard testId="cloudUsage">
      <ApexLineChart data={data} />
    </DashboardCard>
  ) : (
    <NoDataMessage isTop isBold title="Cloud Usage" loading={true} />
  )
}

export default EmissionsOverTimeCard
