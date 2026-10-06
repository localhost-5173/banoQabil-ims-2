// src/repositories/attendanceRepo.ts
import api from "../lib/axios"

export class AttendanceRepo {
  // ✅ Get specific date status of all users
  async getAllUserStatus(page = 1, limit = 10, filters: any = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    })
    const res = await api.get(`/api/attendance/status?${params.toString()}`)
    return res.data
  }

  // ✅ Get full attendance history (all users)
  async getAttendanceHistory(page = 1, limit = 10, filters: any = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    })
    const res = await api.get(`/api/attendance/history?${params.toString()}`)
    return res.data
  }

  // ✅ Get specific user history
  async getUserHistoryByName(name: string) {
    const res = await api.get(`/api/attendance/history/by-name/${name}`)
    return res.data
  }

  // ✅ Update attendance record (admin)
  async updateAttendanceRecord(attendanceId: string, data: any) {
    const res = await api.put(`/api/attendance/update/${attendanceId}`, data)
    return res.data
  }

  // ✅ Delete attendance record (admin)
  async deleteAttendanceRecord(attendanceId: string) {
    const res = await api.delete(`/api/attendance/delete/${attendanceId}`)
    return res.data
  }

  // ✅ Get attendance settings (admin)
  async getSettings() {
    const res = await api.get("/api/attendance/settings")
    return res.data
  }

  // ✅ Update attendance settings (admin)
  async updateSettings(data: any) {
    const res = await api.put("/api/attendance/settings", data)
    return res.data
  }

  // ✅ Fetch server-detected client IP
  async checkIP() {
    const res = await api.get("/api/attendance/check-ip")
    return res.data
  }

}

export const attendanceRepo = new AttendanceRepo()
