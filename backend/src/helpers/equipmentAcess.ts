import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { EquipmentItem } from '../models/EquipmentItem'
import { EquipmentUpdate } from '../models/EquipmentUpdate'
import { EquipmentStatItem } from '../models/EquipmentStatItem'
import { FileHistoryItem } from '../models/FileHistoryItem'
const XAWS = AWSXRay.captureAWS(AWS) // Enable XRay Tracing
const logger = createLogger('equipmentAccess')

/**Implement data layer logic*/

export class EquipmentAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly eqTable = process.env.EQUIPMENT_TABLE,
        private readonly eqTableIndex = process.env.EQUIPMENT_CREATEDAT_INDEX,
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly statTable = process.env.EQUIPMENT_STATISTICS_TABLE,
        private readonly statTableIndex = process.env.EQUIPMENT_STATISTICS_INDEX,
        private readonly histTable = process.env.ATTACHMENT_HISTORY_TABLE,
        private readonly histTableIndex = process.env.ATTACHMENT_HISTORY_INDEX) {
    }

    // Get equipment list for a user
    async getEquipmentListForUser(userId: string): Promise<EquipmentItem[]> {
        logger.info('Getting equipment list for user', {userId: userId})

        const result = await this.docClient.query({
            TableName: this.eqTable,
            IndexName: this.eqTableIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as EquipmentItem[]
    }

    // Create an equipment
    async createEquipment(eqItem: EquipmentItem): Promise<EquipmentItem> {
        logger.info('Creating an equipment', eqItem)

        await this.docClient.put({
            TableName: this.eqTable,
            Item: eqItem
        }).promise()

        return eqItem
    }

    // Update an equipment
    async updateEquipment(userId: string, equipmentId: string, updateItem: EquipmentUpdate) {
        logger.info(`Updating an equipment with equipmentId ${equipmentId} and userId ${userId}`, updateItem)

        await this.docClient.update({
            TableName: this.eqTable,
            Key: {"equipmentId": equipmentId, "userId": userId},
            UpdateExpression: "SET #eqName = :name, statusChangedAt = :statusChangedAt, #statusName = :status",
            ExpressionAttributeValues: {
                ":name": updateItem.name,
                ":statusChangedAt": updateItem.statusChangedAt,
                ":status": updateItem.status
            },
            ExpressionAttributeNames: {
                "#eqName": "name",
                "#statusName": "status"
            },
            ReturnValues: "UPDATED_NEW" //"NONE"
        }).promise()
    }

    // Delete an equipment
    async deleteEquipment(userId: string, equipmentId: string) {
        logger.info(`Deleting an equipment with equipmentId ${equipmentId} and userId ${userId}`)
        await this.docClient.delete({
            TableName: this.eqTable,
            Key: {"equipmentId": equipmentId, "userId": userId}
        }).promise()
    }

    // Update an equipment URL
    async updateEquipmentUrl(userId: string, equipmentId: string) {
        logger.info(`Updating an equipment URL for equipmentId ${equipmentId} with userId ${userId}`)

        // Append time to image URL to prevent Browser from caching image
        // when a new image is expected to be uploaded.
        const milliseconds = new Date().getTime(); // time since the epoch

        await this.docClient.update({
            TableName: this.eqTable,
            Key: {"equipmentId": equipmentId, "userId": userId},
            UpdateExpression: "SET attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": `https://${this.bucketName}.s3.amazonaws.com/${equipmentId}?t=${milliseconds}`
            },
            ReturnValues: "UPDATED_NEW" //"NONE"
        }).promise()
    }

    // Find an equipment (given user id and equipment id)
    async findEquipment(userId: string, equipmentId: string): Promise<EquipmentItem> {
        logger.info(`Looking for an equipment with equipmentId ${equipmentId} and userId ${userId}`)

        const result = await this.docClient.get({
            TableName: this.eqTable,
            Key: {
                userId: userId,
                equipmentId: equipmentId
            }
        }).promise()

        logger.info('Found an equipment', JSON.stringify(result))

        return result.Item as EquipmentItem
    }

    //-------------------------------------------------------

    // Statistics: Find equipment status count
    async findStatusCount(userId: string, statusName: string): Promise<EquipmentStatItem> {
        logger.info(`Looking for equipment status with statusName ${statusName} and userId ${userId}`)
        try {
            const result = await this.docClient.get({
                TableName: this.statTable,
                Key: {
                    userId: userId,
                    statusName: statusName
                }
            }).promise()
            logger.info('Result of findStatusCount', {result: result});
            if (JSON.stringify(result) === '{}') {
                return null
            } else {
                return result.Item as EquipmentStatItem
            }
        } catch (err) {
            logger.error('Error during call to findStatusCount', { error: JSON.stringify(err) })
            return null
        }
    }

    // Statistics: Add first status count entry
    async createStatusCount(statItem: EquipmentStatItem): Promise<EquipmentStatItem> {
        logger.info('Creating a first status count entry', statItem)

        let result = await this.docClient.put({
            TableName: this.statTable,
            Item: statItem
        }).promise()
        logger.info('Result from createStatusCount', {result: result})
        return statItem   
    }

    // Statistics: Increment equipment status count
    async incrementStatusCount(userId: string, statusName: string) {
        logger.info(`Increment status count for userId ${userId} and statusName ${statusName}`)

        const itemFound = await this.findStatusCount(userId, statusName)

        if (itemFound) {
            let currentCount = itemFound.statusCount
            if (currentCount < 0) {
                currentCount = 0
            }
            let newCount = currentCount + 1; 

            let result = await this.docClient.update({
                TableName: this.statTable,
                Key: {"userId": userId, "statusName": statusName},
                UpdateExpression: "SET statusCount = :statusCount, updatedAt = :updatedAt",
                ExpressionAttributeValues: {
                    ":statusCount": newCount,
                    ":updatedAt": new Date().toISOString()
                },
                ReturnValues: "UPDATED_NEW" //"NONE"
            }).promise()
            logger.info('Result from incrementStatusCount', {result: result})
        } else {
            await this.createStatusCount({
                userId: userId,
                statusName: statusName,
                statusCount: 1,
                updatedAt: new Date().toISOString()
            })
        }
    }

    // Statistics: Decrement equipment status count
    async decrementStatusCount(userId: string, statusName: string) {
        logger.info(`Decrement status count for userId ${userId} and statusName ${statusName}`)

        const itemFound = await this.findStatusCount(userId, statusName)

        if (itemFound) {
            let currentCount = itemFound.statusCount
            let newCount = currentCount - 1; 
            if (newCount < 0) {
                newCount = 0;
            }

            let result = await this.docClient.update({
                TableName: this.statTable,
                Key: {"userId": userId, "statusName": statusName},
                UpdateExpression: "SET statusCount = :statusCount, updatedAt = :updatedAt",
                ExpressionAttributeValues: {
                    ":statusCount": newCount,
                    ":updatedAt": new Date().toISOString()
                },
                ReturnValues: "UPDATED_NEW" //"NONE"
            }).promise()
            logger.info('Result from decrementStatusCount', {result: result})
        } else {
            await this.createStatusCount({
                userId: userId,
                statusName: statusName,
                statusCount: 0,
                updatedAt: new Date().toISOString()
            })
        }
    }

    // Statistics: Get equipment Update/Down/Limited status count for a user
    async getEqStatsForUser(userId: string): Promise<EquipmentStatItem[]> {
        logger.info('Getting equipment status count for user', {userId: userId})

        const result = await this.docClient.query({
            TableName: this.statTable,
            IndexName: this.statTableIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as EquipmentStatItem[]
    }

    //-------------------------------------------------------

    // History: save history of file update and file deletion from S3 bucket.
    async saveFileHistory(fileHistItem: FileHistoryItem): Promise<FileHistoryItem> {
        const result = await this.docClient.put({
            TableName: this.histTable,
            Item: fileHistItem
        }).promise()

        logger.info('Result from saveFileHistory', {result: result})

        return fileHistItem
    }

    // History: get file upload/delete history for an equipment.
    async getEquipmentFileHistory(equipmentId: string): Promise<FileHistoryItem[]> {
        const fileId = equipmentId // The equipment ID is used as the file key when storing file in S3
        const result = await this.docClient.query({
            TableName: this.histTable,
            IndexName: this.histTableIndex,
            KeyConditionExpression: 'fileId = :fileId',
            ExpressionAttributeValues: {
                ':fileId' : fileId
            }
        }).promise()

        const items = result.Items
        return items as FileHistoryItem[]
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}