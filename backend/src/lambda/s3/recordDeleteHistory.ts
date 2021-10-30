import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda'
import 'source-map-support/register'
import { SaveFileHistoryRequest } from '../../requests/SaveFileHistoryRequest'
import { saveFileHistory, timeInMs, setLatencyMetric } from '../../helpers/equipment'
import { createLogger } from '../../utils/logger'
const logger = createLogger('recordDeleteHistory')

/**Description: This lambda function gets called when a file is deleted from the S3 bucket.*/

export const handler: SNSHandler = async (event: SNSEvent) => {
   const startTime = timeInMs() // Record time start
   try {
      logger.info('Processing SNS event ', event)
      for (const snsRecord of event.Records) {
         const s3EventStr = snsRecord.Sns.Message
         const s3Event = JSON.parse(s3EventStr) // is instanceof S3Event

         for (const record of s3Event.Records) {
            logger.info('A file just got deleted from S3 bucket', record)

            const theRecord: S3EventRecord = record // is instanceof S3EventRecord

            const deleteHist: SaveFileHistoryRequest = {
               fileId: theRecord.s3.object.key, // file key
               eventTime: theRecord.eventTime, //  time of upload, ex: "2021-09-18T02:41:48.939Z"
               eventName: 'File Deleted', // theRecord.eventName, ex: "ObjectCreated:Put"
               fileSequencer: theRecord.s3.object.sequencer,
               fileSize: null,
               fileEtag: null,
            }

            await saveFileHistory(deleteHist)
         }
      }
   } catch (e) {
      logger.error('RecordDeleteHistory error', { error: JSON.stringify(e) })
      //throw new Error(e)
   } finally {
      const endTime = timeInMs(); // Record time finished
      const totalTime = endTime - startTime;
      await setLatencyMetric('RecordDeleteHistoryMetric', totalTime)
   }
}