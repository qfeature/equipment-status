import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'
import { processEquipmentAddRecord, processEquipmentUpdateRecord, processEquipmentDeleteRecord, timeInMs, setLatencyMetric } from '../../helpers/equipment'
import { createLogger } from '../../utils/logger'
const logger = createLogger('updateEqStats')

/**Update equipment status count Up/Down/Limited when 
 * an equipment is added/updated/removed in DynamoDB table.*/

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
   const startTime = timeInMs() // Record time start
   try {
      logger.info('Processing events batch from DynamoDB', event)

      for (const record of event.Records) {
         if (record.eventName == 'INSERT') {
            try {
               const userId = record.dynamodb.Keys.userId.S
               const newItem = record.dynamodb.NewImage
               const newEq = {
                  userId: newItem.userId.S,
                  equipmentId: newItem.equipmentId.S,
                  createdAt: newItem.createdAt.S,
                  name: newItem.name.S,
                  statusChangedAt: newItem.statusChangedAt.S,
                  status: newItem.status.S ,
                  attachmentUrl: newItem.attachmentUrl.S }

               await processEquipmentAddRecord(userId, newEq)
            } catch (err) {
               logger.error('Error during call to processEquipmentAddRecord', { error: JSON.stringify(err) })
            }
         } else if (record.eventName == 'MODIFY') {
            try {
               const userId = record.dynamodb.Keys.userId.S
               const newItem = record.dynamodb.NewImage
               const oldItem = record.dynamodb.OldImage
               const newEq = {
                  userId: newItem.userId.S,
                  equipmentId: newItem.equipmentId.S,
                  createdAt: newItem.createdAt.S,
                  name: newItem.name.S,
                  statusChangedAt: newItem.statusChangedAt.S,
                  status: newItem.status.S ,
                  attachmentUrl: newItem.attachmentUrl.S }
               const oldEq = {
                  userId: oldItem.userId.S,
                  equipmentId: oldItem.equipmentId.S,
                  createdAt: oldItem.createdAt.S,
                  name: oldItem.name.S,
                  statusChangedAt: oldItem.statusChangedAt.S,
                  status: oldItem.status.S ,
                  attachmentUrl: oldItem.attachmentUrl.S }

               await processEquipmentUpdateRecord(userId, newEq, oldEq)
            } catch (err) {
               logger.error('Error during call to processEquipmentUpdateRecord', { error: JSON.stringify(err) })
            }
         } else if (record.eventName == 'REMOVE') {
            try {
               const userId = record.dynamodb.Keys.userId.S
               const oldItem = record.dynamodb.OldImage
               const oldEq = {
                  userId: oldItem.userId.S,
                  equipmentId: oldItem.equipmentId.S,
                  createdAt: oldItem.createdAt.S,
                  name: oldItem.name.S,
                  statusChangedAt: oldItem.statusChangedAt.S,
                  status: oldItem.status.S ,
                  attachmentUrl: oldItem.attachmentUrl.S }

               await processEquipmentDeleteRecord(userId, oldEq)
            } catch (err) {
               logger.error('Error during call to processEquipmentDeleteRecord', { error: JSON.stringify(err) })
            }
         }
      }
   } catch (e) {
      logger.error('UpdateEqStats error', { error: JSON.stringify(e) })
      //throw new Error(e)
   } finally {
      const endTime = timeInMs(); // Record time finished
      const totalTime = endTime - startTime;
      await setLatencyMetric('UpdateEqStatsMetric', totalTime)
   }
}