export interface FileHistory {
  fileId: string
  historyId: string
  eventTime: string
  eventName: string
  fileSequencer: string
  fileSize?: number
  fileEtag?: string
}