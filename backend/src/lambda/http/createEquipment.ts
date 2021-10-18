import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateEquipmentRequest } from '../../requests/CreateEquipmentRequest'
import { getUserId } from '../utils'
import { createEquipment /*, timeInMs, setLatencyMetric*/ } from '../../helpers/equipment'

import { createLogger } from '../../utils/logger'
const logger = createLogger('createEquipment')

//import * as AWS from 'aws-sdk'
//const docClient = new AWS.DynamoDB.DocumentClient()
//const eqTable = process.env.EQUIPMENT_TABLE

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing CreateEquipment event', event)

    const newEquipment: CreateEquipmentRequest = JSON.parse(event.body)
    const userId = getUserId(event)

    const newItem = await createEquipment(userId, newEquipment)
    logger.info('New equipment created', newItem)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem
      })
    }
})

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )