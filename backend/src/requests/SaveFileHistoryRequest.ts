/**
 * Fields in a request to save file upload and delete events in S3 bucket.
 */
export interface SaveFileHistoryRequest {
  fileId: string
  eventTime: string
  eventName: string
  fileSequencer: string
  fileSize?: number
  fileEtag?: string
}