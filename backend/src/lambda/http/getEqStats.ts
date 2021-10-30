import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getEqStatsForUser, timeInMs, setLatencyMetric } from '../../helpers/equipment'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'
const logger = createLogger('getEqStats')

/**Get the total equipment status count of Up, Down, Limited for a user.*/

export const handler = middy(
   async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const startTime = timeInMs() // Record time start
      try {
         logger.info('Processing GetEqStats event', event)

         const userId = getUserId(event)
         const eqStats = await getEqStatsForUser(userId)

         logger.info('Equipment status count found', eqStats)

         return {
            statusCode: 200,
            body: JSON.stringify({
               items: eqStats
            })
         }
      } catch (e) {
         logger.error('GetEqStats error', { error: JSON.stringify(e) })
         throw new Error(e)
      } finally {
         const endTime = timeInMs(); // Record time finished
         const totalTime = endTime - startTime;
         await setLatencyMetric('GetEqStatsMetric', totalTime)
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