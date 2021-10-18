import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// Implement file storage logic

import { createLogger } from '../utils/logger'
const logger = createLogger('attachmentUtils')

export class AttachmentUtils {
    constructor(
        private readonly s3 = new XAWS.S3({signatureVersion: 'v4'}), // An instance of S3 client
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
    }

    // create a presigned URL
    async getUploadUrl(equipmentId: string) {
        logger.info(`Generating signed URL with key ${equipmentId}`)

        const signedUrl = await this.s3.getSignedUrl('putObject', {
          Bucket: this.bucketName,
          Key: equipmentId,
          Expires: parseInt(this.urlExpiration) // This expects an integer
        })

        return signedUrl
    }
}