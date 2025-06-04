import api from './api'
import type { ComplaintFilterParams, ICreateComplaint, IUpdateComplaint } from '@/models/complaint'

export class ComplaintService {
  async fetchComplaints(
    page: number,
    pageSize: number,
    filters?: ComplaintFilterParams
  ) {
    try {
      const response = await api.get('/complaints', {
        params: {
          page,
          pageSize,
          ...filters
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching complaints:', error)
      throw error
    }
  }

  async createComplaint(complaintData: ICreateComplaint) {
    try {
      const formData = new FormData()
      formData.append('title', complaintData.title)
      formData.append('description', complaintData.description)
      formData.append('category', complaintData.category)
      formData.append('priority', complaintData.priority)
      if (complaintData.relatedWorkerId) {
        formData.append('relatedWorkerId', complaintData.relatedWorkerId)
      }

      if (complaintData.attachments) {
        for (let i = 0; i < complaintData.attachments.length; i++) {
          formData.append('attachments', complaintData.attachments[i])
        }
      }

      const response = await api.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error creating complaint:', error)
      throw error
    }
  }

  async updateComplaint(id: string, complaintData: IUpdateComplaint) {
    try {
      const formData = new FormData()
      if (complaintData.title) formData.append('title', complaintData.title)
      if (complaintData.description) formData.append('description', complaintData.description)
      if (complaintData.category) formData.append('category', complaintData.category)
      if (complaintData.priority) formData.append('priority', complaintData.priority)
      if (complaintData.status) formData.append('status', complaintData.status)
      if (complaintData.assignedToId) formData.append('assignedToId', complaintData.assignedToId)
      if (complaintData.resolution) formData.append('resolution', complaintData.resolution)

      if (complaintData.attachments) {
        for (let i = 0; i < complaintData.attachments.length; i++) {
          formData.append('attachments', complaintData.attachments[i])
        }
      }

      const response = await api.put(`/complaints/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error updating complaint:', error)
      throw error
    }
  }

  async deleteComplaint(id: string) {
    try {
      const response = await api.delete(`/complaints/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting complaint:', error)
      throw error
    }
  }

  async updateComplaintStatus(id: string, status: string) {
    try {
      const response = await api.patch(`/complaints/${id}/status`, { status })
      return response.data
    } catch (error) {
      console.error('Error updating complaint status:', error)
      throw error
    }
  }
} 