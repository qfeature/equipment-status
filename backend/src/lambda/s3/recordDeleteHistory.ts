import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda'
import 'source-map-support/register'

import { createLogger } from '../../utils/logger'
const logger = createLogger('recordDeleteHistory')

export const handler: SNSHandler = async (event: SNSEvent) => {
    logger.info('Processing SNS event ', event)

    for (const snsRecord of event.Records) {
      const s3EventStr = snsRecord.Sns.Message
      logger.info('Processing S3 event', s3EventStr)
      const s3Event = JSON.parse(s3EventStr)
  
      for (const record of s3Event.Records) {
        logger.info('A file just got deleted from S3 bucket', record)
        
        // "record" is an instance of S3EventRecord
        await saveDeleteHistory(record)
      }
    }
}

async function saveDeleteHistory(record: S3EventRecord) {
    logger.info('The key of the file deleted', {key: record.s3.object.key})
    // The key of the deleted image.
    //const key = record.s3.object.key
    // const uploadedInfo = {
    //   eventName: record.eventName, // event type, ex: "ObjectRemoved:Delete"
    //   eventTime: record.eventTime, // time of upload, ex: "2021-09-18T02:41:48.939Z"
    //   key: record.s3.object.key, // file key
    //   sequencer: record.s3.object.sequencer // Not important to record
    // }
    // logger.info('A file just got deleted from S3 bucket', uploadedInfo)
}