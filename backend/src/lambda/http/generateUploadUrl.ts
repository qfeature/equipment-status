import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createAttachmentPresignedUrl, findEquipment, timeInMs, setLatencyMetric } from '../../helpers/equipment'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')

/**Get a presigned URL to upload an image for an equipment*/

export const handler = middy(
   async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const startTime = timeInMs() // Record time start
      try {
         logger.info('Processing GenerateUploadUrl event', event)

         const equipmentId = event.pathParameters.equipmentId

         if (!equipmentId) {
            return {
               statusCode: 404,
               body: JSON.stringify({ error: 'EquipmentId not provided' })
            }
         }

         const userId = getUserId(event)

         // Check if equipment belongs to user
         const eqItem = await findEquipment(userId, equipmentId)
         if (!eqItem) {
            return {
               statusCode: 404,
               body: JSON.stringify({ error: 'No presigned URL created. Equipment is not owned by user.' })
            }
         }

         const presignedUrl = await createAttachmentPresignedUrl(userId, equipmentId)
         logger.info('Created presigned URL', presignedUrl)

         return {
            statusCode: 200,
            body: JSON.stringify({ uploadUrl: presignedUrl })
         }
      } catch (e) {
         logger.error('GenerateUploadUrl error', { error: JSON.stringify(e) })
         throw new Error(e)
      } finally {
         const endTime = timeInMs(); // Record time finished
         const totalTime = endTime - startTime;
         await setLatencyMetric('GenerateUploadUrlMetric', totalTime)
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