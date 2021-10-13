import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
//import { CreateEquipmentRequest } from '../../requests/CreateEquipmentRequest'
import * as uuid from 'uuid'

const docClient = new AWS.DynamoDB.DocumentClient()
const eqTable = process.env.EQUIPMENT_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event:', event)

  const userId = 'auth0|someuser'; // STUB FOR NOW
  const equipmentId = uuid.v4() // Unique ID

  const parsedBody = JSON.parse(event.body)

  const newItem = {
      userId: userId
      , equipmentId: equipmentId
      , name: parsedBody.name
      , createdAt: new Date().toISOString()
      , status: parsedBody.status
      , statusChangedAt: new Date().toISOString()
      , attachmentUrl: ''
  }

  await docClient.put({
    TableName: eqTable
    , Item: newItem
  }).promise()

  return {
    statusCode: 201
    , headers: {
      'Access-Control-Allow-Origin': '*'
    }
    , body: JSON.stringify({
        newItem
    })
  }
}