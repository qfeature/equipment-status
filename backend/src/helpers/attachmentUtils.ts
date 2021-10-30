import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS) // Enable XRay Tracing

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

    // delete a file from S3 bucket
    async deleteUploadedFile(equipmentId: string) {
        logger.info(`Deleting the uploaded file with key ${equipmentId}`)
        const params = {
            Bucket: this.bucketName,
            Key: equipmentId,
        }

        try {
            await this.s3.headObject(params).promise() // Check file is in S3 bucket
            try {
                await this.s3.deleteObject(params).promise() // Delete file from S3 bucket
                logger.info('Deleted uploaded file successfully', { key: equipmentId })
            } catch (e) {
                logger.error('Unable to delete uploaded file', { error: JSON.stringify(e) })
            }
        } catch (err) {
            logger.error('Uploaded file not found', { error: JSON.stringify(err) })
        }
    }
}