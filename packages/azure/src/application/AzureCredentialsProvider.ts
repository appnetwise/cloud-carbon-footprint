/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  ClientCertificateCredential,
  ClientSecretCredential,
  DefaultAzureCredential,
  TokenCredential,
  WorkloadIdentityCredential,
} from '@azure/identity'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

import { configLoader } from '@cloud-carbon-footprint/common'

import { default as mappping } from './tenant-settings.json'

export default class AzureCredentialsProvider {
  static async create(): Promise<
    | ClientCertificateCredential
    | ClientSecretCredential
    | WorkloadIdentityCredential
    | DefaultAzureCredential
  > {
    const clientId = configLoader().AZURE.authentication.clientId
    const clientSecret = configLoader().AZURE.authentication.clientSecret
    const tenantId = configLoader().AZURE.authentication.tenantId
    const certificatePath = configLoader().AZURE.authentication.certificatePath

    switch (configLoader().AZURE.authentication.mode) {
      case 'GCP':
        const clientIdFromGoogle = await this.getGoogleSecret(clientId)
        const clientSecretFromGoogle = await this.getGoogleSecret(clientSecret)
        const tenantIdFromGoogle = await this.getGoogleSecret(tenantId)
        return new ClientSecretCredential(
          tenantIdFromGoogle,
          clientIdFromGoogle,
          clientSecretFromGoogle,
        )
      case 'WORKLOAD_IDENTITY':
        return new WorkloadIdentityCredential({
          tenantId: tenantId,
          clientId: clientId,
        })
      case 'CERTIFICATE':
        return new ClientCertificateCredential(
          tenantId,
          clientId,
          certificatePath,
        )
      case 'MANAGED_IDENTITY':
        return new DefaultAzureCredential()
      default:
        return new ClientSecretCredential(tenantId, clientId, clientSecret)
    }
  }

  static getDefaultSubscriptionIdsForTenant(tenantId: string): string[] {
    const config = mappping[tenantId]
    return config.AZURE_SUBSCRIPTIONS
  }

  static async createCredentialForTenant(
    tenantId: string,
    accessToken?: string,
  ): Promise<
    | ClientCertificateCredential
    | ClientSecretCredential
    | WorkloadIdentityCredential
    | DefaultAzureCredential
    | TokenCredential
  > {
    const config = mappping[tenantId]
    // Note: Client Id and Secret are same and hence will be shared across tenants
    const clientId = configLoader().AZURE.authentication.clientId
    const clientSecret = configLoader().AZURE.authentication.clientSecret
    const certificatePath = config.AZURE_AUTH_CERT_PATH
    const authMode = accessToken ? "ACCESS_TOKEN": config.AZURE_AUTH_MODE;
    switch (authMode) {
      case 'GCP':
        const clientIdFromGoogle = await this.getGoogleSecret(clientId)
        const clientSecretFromGoogle = await this.getGoogleSecret(clientSecret)
        const tenantIdFromGoogle = await this.getGoogleSecret(tenantId)
        return new ClientSecretCredential(
          tenantIdFromGoogle,
          clientIdFromGoogle,
          clientSecretFromGoogle,
        )
      case 'WORKLOAD_IDENTITY':
        return new WorkloadIdentityCredential({
          tenantId: tenantId,
          clientId: clientId,
        })
      case 'CERTIFICATE':
        return new ClientCertificateCredential(
          tenantId,
          clientId,
          certificatePath,
        )
      case 'MANAGED_IDENTITY':
        return new DefaultAzureCredential()
      case 'ACCESS_TOKEN':
          return {
            getToken: async () => ({ token: accessToken, expiresOnTimestamp: Date.now() + 60 * 60 * 1000 })
          };
      default:
        return new ClientSecretCredential(tenantId, clientId, clientSecret)
    }
  }

  static async getGoogleSecret(secretName: string): Promise<string> {
    const client = new SecretManagerServiceClient()
    const name = `projects/${
      configLoader().GCP.BILLING_PROJECT_NAME
    }/secrets/${secretName}/versions/latest`

    const [version] = await client.accessSecretVersion({
      name: name,
    })
    return version.payload.data.toString()
  }
}
