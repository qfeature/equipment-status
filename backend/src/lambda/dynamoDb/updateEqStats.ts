import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'

import { processEquipmentAddRecord, processEquipmentUpdateRecord, processEquipmentDeleteRecord /*, timeInMs, setLatencyMetric*/ } from '../../helpers/equipment'

import { createLogger } from '../../utils/logger'
const logger = createLogger('updateEqStats')

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
    logger.info('Processing events batch from DynamoDB', event)

    for (const record of event.Records) {
        if (record.eventName == 'INSERT') {
            
            try {
                const userId = record.dynamodb.Keys.userId.S
                const newItem = record.dynamodb.NewImage
                await processEquipmentAddRecord(userId, newItem)
            } catch (err) {
                logger.error('Error during call to processEquipmentAddRecord', { error: JSON.stringify(err) })
            }

        } else if (record.eventName == 'MODIFY') {

            try {
                const userId = record.dynamodb.Keys.userId.S
                const newItem = record.dynamodb.NewImage
                const oldItem = record.dynamodb.OldImage
                await processEquipmentUpdateRecord(userId, newItem, oldItem)
            } catch (err) {
                logger.error('Error during call to processEquipmentUpdateRecord', { error: JSON.stringify(err) })
            }

        } else if (record.eventName == 'REMOVE') {

            try {
                const userId = record.dynamodb.Keys.userId.S
                const oldItem = record.dynamodb.OldImage
                await processEquipmentDeleteRecord(userId, oldItem)
            } catch (err) {
                logger.error('Error during call to processEquipmentDeleteRecord', { error: JSON.stringify(err) })
            }
        }
    }
}