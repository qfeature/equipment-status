import { EquipmentAccess } from './equipmentAcess'
import { AttachmentUtils } from './attachmentUtils'
import { EquipmentItem } from '../models/EquipmentItem'
import { EquipmentStatItem } from '../models/EquipmentStatItem'
import { FileHistoryItem } from '../models/FileHistoryItem'
import { CreateEquipmentRequest } from '../requests/CreateEquipmentRequest'
import { UpdateEquipmentRequest } from '../requests/UpdateEquipmentRequest'
import { SaveFileHistoryRequest } from '../requests/SaveFileHistoryRequest'
import { MetricUtils } from './metricUtils';
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// Implement business logic

const logger = createLogger('equipment')
const eqAccess = new EquipmentAccess()

// Get all equipment for a user
export async function getEquipmentListForUser(userId: string): Promise<EquipmentItem[]> {
    logger.info('Getting equipment list for user', userId)
    return await eqAccess.getEquipmentListForUser(userId)
}

// Create an equipment
export async function createEquipment(userId: string, createEquipmentRequest: CreateEquipmentRequest): Promise<EquipmentItem> {
    logger.info(`Creating an equipment for user ${userId}`, createEquipmentRequest)

    const equipmentId = uuid.v4() // Unique ID
    logger.info('Creating new equipment with equipmentId', equipmentId)

    return await eqAccess.createEquipment({
        userId: userId,
        equipmentId: equipmentId,
        createdAt: new Date().toISOString(),
        name: createEquipmentRequest.name,
        statusChangedAt: new Date().toISOString(),
        status: createEquipmentRequest.status,
        attachmentUrl: ''
    })
}

// Update an equipment
export async function updateEquipment(userId: string, equipmentId: string, updateEquipmentRequest: UpdateEquipmentRequest) {
    logger.info(`Updating equipment with equipmentId ${equipmentId} for userId ${userId}`, updateEquipmentRequest)
    await eqAccess.updateEquipment(
        userId,
        equipmentId,
        {
            name: updateEquipmentRequest.name,
            statusChangedAt: updateEquipmentRequest.statusChangedAt,
            status: updateEquipmentRequest.status 
        }
    )
}

// Delete equipment
export async function deleteEquipment(userId: string, equipmentId: string) {
    logger.info('Deleting equipment', {"userId": userId, "equipmentId": equipmentId})
    await eqAccess.deleteEquipment(userId, equipmentId)

    // Delete the uploaded image from S3 bucket
    const attachmentUtils = new AttachmentUtils()
    await attachmentUtils.deleteUploadedFile(equipmentId)
}

// Create presigned URL
export async function createAttachmentPresignedUrl(userId: string, equipmentId: string) {
    logger.info('Creating attachment presigned URL', {"userId": userId, "equipmentId": equipmentId})

    // save attachment URL for an equipment
    await eqAccess.updateEquipmentUrl(userId, equipmentId)

    // get a presigned URL
    const attachmentUtils = new AttachmentUtils()
    const signedUrl = await attachmentUtils.getUploadUrl(equipmentId);

    return signedUrl
}

// Find an equipment (given user id and equipment id)
export async function findEquipment(userId: string, equipmentId: string): Promise<EquipmentItem> {
    const eqItem = await eqAccess.findEquipment(userId, equipmentId)
    return eqItem
}

//-------------------------------------------------------------

// Statistics: increment equipment status count
export async function processEquipmentAddRecord(userId: string, newItem: any) {
    let newStatus = newItem.status.S
    await eqAccess.incrementStatusCount(userId, newStatus)
}

// Statistics: increment and decrement equipment status count
export async function processEquipmentUpdateRecord(userId: string, newItem: any, oldItem: any) {
    let newStatus = newItem.status.S
    let oldStatus = oldItem.status.S
    if (newStatus !== oldStatus) {
        // Increment for new status
        await eqAccess.incrementStatusCount(userId, newStatus)

        // Decrement for old status
        await eqAccess.decrementStatusCount(userId, oldStatus)
    }
}

// Statistics: decrement equipment status count
export async function processEquipmentDeleteRecord(userId: string, oldItem: any) {
    let oldStatus = oldItem.status.S
    await eqAccess.decrementStatusCount(userId, oldStatus)
}

// Statistics: get equipment Update/Down/Limited status count for a user
export async function getEqStatsForUser(userId: string): Promise<EquipmentStatItem[]> {
    logger.info('Getting equipment status count for user', userId)
    return await eqAccess.getEqStatsForUser(userId)
}

//-------------------------------------------------------------

// History: save history of file update and file deletion from S3 bucket.
export async function saveFileHistory(fileHist: SaveFileHistoryRequest): Promise<FileHistoryItem> {
    const historyId = uuid.v4() // Unique ID

    return await eqAccess.saveFileHistory({
        fileId: fileHist.fileId,
        historyId: historyId,
        eventTime: fileHist.eventTime,
        eventName: fileHist.eventName,
        fileSequencer: fileHist.fileSequencer,
        fileSize: fileHist.fileSize,
        fileEtag: fileHist.fileEtag
    })
}

//-------------------------------------------------------------

// Metric: Set latency metric
export async function setLatencyMetric(serviceName: string, totalTime: number) {
    const metricUtils = new MetricUtils()
    await metricUtils.setLatencyMetric(serviceName, totalTime)
}

// Metric: Get current time
export function timeInMs() {
    return new Date().getTime()
}