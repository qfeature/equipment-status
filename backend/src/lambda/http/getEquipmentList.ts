import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getEquipmentListForUser /*, timeInMs, setLatencyMetric*/ } from '../../helpers/equipment'
import { getUserId } from '../utils';

//import * as AWS from 'aws-sdk'

import { createLogger } from '../../utils/logger'
const logger = createLogger('getEquipmentList')

//const docClient = new AWS.DynamoDB.DocumentClient()
//const eqTable = process.env.EQUIPMENT_TABLE

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing GetEquipmentList event', event)
    const userId = getUserId(event)
    const eqList = await getEquipmentListForUser(userId)
    logger.info('Equipment list found', eqList)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: eqList
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