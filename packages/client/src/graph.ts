/**
 * Attaches a given access token to a MS Graph API call. Returns information about the user
 * @param accessToken - The access token to authenticate the MS Graph API call
 * @returns A promise resolving to the user information from MS Graph API
 */
export async function callMsGraph(accessToken) {
  const headers = new Headers()
  const bearer = `Bearer ${accessToken}`

  headers.append('Authorization', bearer)
  const api = 'http://localhost:4000/api'

  const options = {
    method: 'GET',
    headers: headers,
  }

  try {
    const response = await fetch(`${api}/profile`, options)
    return await response.json()
  } catch (error) {
    console.error(error)
    throw error
  }
}
