import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateEquipmentRequest } from '../../requests/CreateEquipmentRequest'
import { getUserId } from '../utils'
import { createEquipment, timeInMs, setLatencyMetric } from '../../helpers/equipment'
import { createLogger } from '../../utils/logger'
const logger = createLogger('createEquipment')

/**Create a new equipment for a user.*/

export const handler = middy(
   async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const startTime = timeInMs() // Record time start
      try {
         logger.info('Processing CreateEquipment event', event)

         const newEquipment: CreateEquipmentRequest = JSON.parse(event.body)
         const userId = getUserId(event)

         const newItem = await createEquipment(userId, newEquipment)
         logger.info(`New equipment created: ${newItem.equipmentId}, ${newItem.name}, ${newItem.status}`)

         return {
            statusCode: 201,
            body: JSON.stringify({
               item: newItem
            })
         }
      } catch (e) {
         logger.error('CreateEquipment error', { error: JSON.stringify(e) })
         throw new Error(e)
      } finally {
         const endTime = timeInMs(); // Record time finished
         const totalTime = endTime - startTime;
         await setLatencyMetric('CreateEquipmentMetric', totalTime)
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