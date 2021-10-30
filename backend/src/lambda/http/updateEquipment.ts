import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateEquipment, findEquipment /*, timeInMs, setLatencyMetric*/ } from '../../helpers/equipment'
import { UpdateEquipmentRequest } from '../../requests/UpdateEquipmentRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('updateEquipment')

export const handler = middy(
   async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      logger.info('Processing UpdateEquipment event', event)

      const equipmentId = event.pathParameters.equipmentId
      const updatedEq: UpdateEquipmentRequest = JSON.parse(event.body)

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
               error: 'Equipment not updated. Equipment is not owned by user.'
            })
         }
      }

      await updateEquipment(userId, equipmentId, updatedEq)
      logger.info(`Equipment updated for equipmentId ${equipmentId} with userId ${userId}`, updatedEq)

      return {
         statusCode: 201,
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