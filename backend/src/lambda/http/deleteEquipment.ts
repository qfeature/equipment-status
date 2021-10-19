import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteEquipment, findEquipment /*, timeInMs, setLatencyMetric*/ } from '../../helpers/equipment'
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'
const logger = createLogger('deleteEquipment')

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info('Processing DeleteEquipment event', event)
        const equipmentId = event.pathParameters.equipmentId

        if (!equipmentId) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                error: 'EquipmentId not provided'
                })
            }
        }

        const userId = getUserId(event)

        // Check if equipment belongs to user
        const eqItem = await findEquipment(userId, equipmentId)
        if (!eqItem) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: 'Equipment not deleted. Equipment is not owned by user.'
                })
            }
        }

        await deleteEquipment(userId, equipmentId)
        logger.info('Equipment deleted', {"userId": userId, "equipmentId": equipmentId})

        return {
            statusCode: 200,
            body: JSON.stringify({})
        }
    }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )