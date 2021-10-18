import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { EquipmentItem } from '../models/EquipmentItem'
import { EquipmentUpdate } from '../models/EquipmentUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('equipmentAccess')

// Implement data layer logic

export class EquipmentAccess {

    // class constructor
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly eqTable = process.env.EQUIPMENT_TABLE,
        private readonly eqTableIndex = process.env.EQUIPMENT_CREATEDAT_INDEX,
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET) {
    }

    // Get equipment list for a user
    async getEquipmentListForUser(userId: string): Promise<EquipmentItem[]> {
        logger.info('Getting equipment list for user', userId)

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
        logger.info('Creating an equipment', eqItem.equipmentId)

        await this.docClient.put({
            TableName: this.eqTable,
            Item: eqItem
        }).promise()

        return eqItem
    }

    // Update an equipment
    async updateEquipment(userId: string, equipmentId: string, updateItem: EquipmentUpdate) {
        logger.info(`Updating an equipment with equipmentId ${equipmentId} and userId ${userId}`, JSON.stringify(updateItem))

        const result = await this.docClient.update({
            TableName: this.eqTable,
            Key: {"equipmentId": equipmentId, "userId": userId},
            UpdateExpression: "SET #eqName = :name, statusChangedAt = :statusChangedAt, status = :status",
            ExpressionAttributeValues: {
                ":name": updateItem.name,
                ":statusChangedAt": updateItem.statusChangedAt,
                ":status": updateItem.status
            },
            ExpressionAttributeNames: {
                "#eqName": "name"
            },
            ReturnValues: "UPDATED_NEW" //"NONE"
        }).promise()

        logger.info('The updated result UPDATED_NEW', JSON.stringify(result))
        //return undefined
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

        const result = await this.docClient.update({
            TableName: this.eqTable,
            Key: {"equipmentId": equipmentId, "userId": userId},
            UpdateExpression: "SET attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": `https://${this.bucketName}.s3.amazonaws.com/${equipmentId}`
            },
            ReturnValues: "UPDATED_NEW" //"NONE"
        }).promise()

        logger.info('The updated URL result UPDATED_NEW', JSON.stringify(result))
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