import { apiEndpoint } from '../config'
import { Equipment } from '../types/Equipment';
import { CreateEquipmentRequest } from '../types/CreateEquipmentRequest';
import Axios from 'axios'
import { UpdateEquipmentRequest } from '../types/UpdateEquipmentRequest';
import { StatusCount } from '../types/StatusCount'
import { FileHistory } from '../types/FileHistory'

export async function getEquipmentList(idToken: string): Promise<Equipment[]> {
  const response = await Axios.get(`${apiEndpoint}/equipment`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Equipment List:', response.data)
  return response.data.items
}

export async function createEquipment(
  idToken: string,
  newEquipment: CreateEquipmentRequest
): Promise<Equipment> {
  const response = await Axios.post(`${apiEndpoint}/equipment`,  JSON.stringify(newEquipment), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function updateEquipment(
  idToken: string,
  equipmentId: string,
  updatedEquipment: UpdateEquipmentRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/equipment/${equipmentId}`, JSON.stringify(updatedEquipment), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteEquipment(
  idToken: string,
  equipmentId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/equipment/${equipmentId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  equipmentId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/equipment/${equipmentId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}

export async function getEquipmentStatusStats(idToken: string): Promise<StatusCount[]> {
  const response = await Axios.get(`${apiEndpoint}/equipment/statuscount`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Equipment Status Count List:', response.data)
  return response.data.items
}

export async function getFileUploadHistory(idToken: string, equipmentId: string): Promise<FileHistory[]> {
  const response = await Axios.get(`${apiEndpoint}/equipment/filehistory/${equipmentId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('File upload history:', response.data)
  return response.data.items
}