import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda'
import 'source-map-support/register'
import { SaveFileHistoryRequest } from '../../requests/SaveFileHistoryRequest'
import { saveFileHistory, timeInMs, setLatencyMetric } from '../../helpers/equipment'
import { createLogger } from '../../utils/logger'
const logger = createLogger('recordUploadHistory')

/**Description: This lambda function gets called when a file is uploaded to the S3 bucket.*/

export const handler: SNSHandler = async (event: SNSEvent) => {
   const startTime = timeInMs() // Record time start
   try {
      logger.info('Processing SNS event ', event)
      for (const snsRecord of event.Records) {
         const s3EventStr = snsRecord.Sns.Message
         const s3Event = JSON.parse(s3EventStr) // is instanceof S3Event

         for (const record of s3Event.Records) {
            logger.info('A file just got uploaded to S3 bucket', record)

            const theRecord: S3EventRecord = record // is instanceof S3EventRecord

            const uploadHist: SaveFileHistoryRequest = {
               fileId: theRecord.s3.object.key, // file key
               eventTime: theRecord.eventTime, //  time of upload, ex: "2021-09-18T02:41:48.939Z"
               eventName: 'File Uploaded', // theRecord.eventName, ex: "ObjectCreated:Put"
               fileSequencer: theRecord.s3.object.sequencer,
               fileSize: theRecord.s3.object.size, // file size in bytes, ex: 37441
               fileEtag: theRecord.s3.object.eTag, // Version of the file. Reflects changes to contents
            }

            await saveFileHistory(uploadHist)
         }
      }
   } catch (e) {
      logger.error('RecordUploadHistory error', { error: JSON.stringify(e) })
      //throw new Error(e)
   } finally {
      const endTime = timeInMs(); // Record time finished
      const totalTime = endTime - startTime;
      await setLatencyMetric('RecordUploadHistoryMetric', totalTime)
   }
}