import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda'
import 'source-map-support/register'

import { createLogger } from '../../utils/logger'
const logger = createLogger('recordImageUpload')

export const handler: SNSHandler = async (event: SNSEvent) => {
    logger.info('Processing SNS event ', event)

    for (const snsRecord of event.Records) {
      const s3EventStr = snsRecord.Sns.Message
      logger.info('Processing S3 event', s3EventStr)
      const s3Event = JSON.parse(s3EventStr)
  
      for (const record of s3Event.Records) {
        logger.info('A file just got uploaded to S3 bucket', record)
        
        // "record" is an instance of S3EventRecord
        await saveUploadHistory(record)
      }
    }
}

async function saveUploadHistory(record: S3EventRecord) {
    // The key of the newly uploaded image.
    //const key = record.s3.object.key
    const uploadedInfo = {
      eventTime: record.eventTime, // time of upload, ex: "2021-09-18T02:41:48.939Z"
      eventName: record.eventName, // event type, ex: "ObjectCreated:Put"
      key: record.s3.object.key, // file key
      size: record.s3.object.size, // file size in bytes, is a number, ex: 37441
      eTag: record.s3.object.eTag, // Represent specific version of the file. Refects changes to the contents of the file.
      sequencer: record.s3.object.sequencer // Not important to record
    }
    logger.info('A file just got uploaded to S3 bucket', uploadedInfo)
}