// API endpoint information
const apiId = 'dx1pw0juk4'
export const apiEndpoint = `https://${apiId}.execute-api.us-west-1.amazonaws.com/dev`

export const authConfig = {
  // Create an Auth0 application and copy values from it into this map.
  domain: 'dev-i9zmlvbg.us.auth0.com',          // Auth0 domain
  clientId: '8ypow6CEssN5KmLdUORaqX8CFZghHH0M', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}