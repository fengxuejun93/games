import axios from 'axios'

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000
})

instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (data) => instance.post('/login', data),
  register: (data) => instance.post('/register', data)
}

export const attendanceAPI = {
  checkIn: (data) => instance.post('/attendance/checkin', data),
  checkOut: (data) => instance.post('/attendance/checkout', data),
  getDaily: (params) => instance.get('/attendance/daily', { params }),
  getList: (params) => instance.get('/attendance/list', { params }),
  getStatistics: (params) => instance.get('/attendance/statistics', { params }),
  update: (data) => instance.put('/attendance', data)
}

export const adjustmentAPI = {
  apply: (data) => instance.post('/adjustment/apply', data),
  getList: (params) => instance.get('/adjustment/list', { params }),
  approve: (data) => instance.post('/adjustment/approve', data),
  reject: (data) => instance.post('/adjustment/reject', data)
}

export const leaveAPI = {
  apply: (data) => instance.post('/leave/apply', data),
  getList: (params) => instance.get('/leave/list', { params }),
  approve: (data) => instance.post('/leave/approve', data),
  reject: (data) => instance.post('/leave/reject', data)
}

export const employeeAPI = {
  getAll: () => instance.get('/employees'),
  getById: (id) => instance.get(`/employees/${id}`),
  update: (id, data) => instance.put(`/employees/${id}`, data),
  delete: (id) => instance.delete(`/employees/${id}`)
}

export const departmentAPI = {
  getAll: () => instance.get('/departments'),
  getById: (id) => instance.get(`/departments/${id}`),
  create: (data) => instance.post('/departments', data),
  update: (id, data) => instance.put(`/departments/${id}`, data),
  delete: (id) => instance.delete(`/departments/${id}`)
}

export const exportAPI = {
  attendance: (params) => instance.get('/export/attendance', { params, responseType: 'blob' })
}

export const lateAPI = {
  getStatus: (params) => instance.get('/late/status', { params }),
  getExceeded: (params) => instance.get('/late/exceeded', { params }),
  getStats: (params) => instance.get('/late/stats', { params })
}