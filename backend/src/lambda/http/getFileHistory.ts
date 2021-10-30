import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getEquipmentFileHistory, findEquipment /*, timeInMs, setLatencyMetric*/ } from '../../helpers/equipment'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'
const logger = createLogger('getFileHistory')

/**Get the history of file upload and delete in S3 bucket for an equipment.*/

export const handler = middy(
   async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      logger.info('Processing GetFileHistory event', event)

      const equipmentId = event.pathParameters.equipmentId

      // Check if equipment Id is provided
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
            error: 'Equipment file history not returned. Equipment is not owned by user.'
         })
      }
      }

      const fileHist = await getEquipmentFileHistory(equipmentId)
      logger.info('File history found', fileHist)

      return {
         statusCode: 200,
         body: JSON.stringify({
            items: fileHist
         })
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