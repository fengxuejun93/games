import axios from 'axios'

const instance = axios.create({
  baseURL: '/api',
  timeout: 5000
})

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login(data) {
    return instance.post('/auth/login', data)
  },
  getUserInfo() {
    return instance.get('/auth/info')
  },
  logout() {
    return instance.post('/auth/logout')
  }
}

export const companyApi = {
  list(pageNum, pageSize, name) {
    return instance.get('/companies', { params: { pageNum, pageSize, name } })
  },
  getAll() {
    return instance.get('/companies/all')
  },
  getById(id) {
    return instance.get(`/companies/${id}`)
  },
  create(data) {
    return instance.post('/companies', data)
  },
  update(id, data) {
    return instance.put(`/companies/${id}`, data)
  },
  delete(id) {
    return instance.delete(`/companies/${id}`)
  }
}

export const departmentApi = {
  list(companyId, pageNum, pageSize, name) {
    return instance.get('/departments', { params: { companyId, pageNum, pageSize, name } })
  },
  getByCompanyId(companyId) {
    return instance.get(`/departments/company/${companyId}`)
  },
  getById(id) {
    return instance.get(`/departments/${id}`)
  },
  create(data) {
    return instance.post('/departments', data)
  },
  update(id, data) {
    return instance.put(`/departments/${id}`, data)
  },
  delete(id) {
    return instance.delete(`/departments/${id}`)
  }
}

export const positionApi = {
  list(companyId, pageNum, pageSize, name) {
    return instance.get('/positions', { params: { companyId, pageNum, pageSize, name } })
  },
  getByCompanyId(companyId) {
    return instance.get(`/positions/company/${companyId}`)
  },
  getById(id) {
    return instance.get(`/positions/${id}`)
  },
  create(data) {
    return instance.post('/positions', data)
  },
  update(id, data) {
    return instance.put(`/positions/${id}`, data)
  },
  delete(id) {
    return instance.delete(`/positions/${id}`)
  }
}

export const employeeApi = {
  list(companyId, pageNum, pageSize, realName) {
    return instance.get('/employees', { params: { companyId, pageNum, pageSize, realName } })
  },
  getById(id) {
    return instance.get(`/employees/${id}`)
  },
  getRoles(id) {
    return instance.get(`/employees/${id}/roles`)
  },
  create(data) {
    return instance.post('/employees', data)
  },
  update(id, data) {
    return instance.put(`/employees/${id}`, data)
  },
  delete(id) {
    return instance.delete(`/employees/${id}`)
  },
  assignRoles(id, roleIds) {
    return instance.post(`/employees/${id}/roles`, { roleIds })
  },
  export(companyId) {
    return instance.get(`/employees/export?companyId=${companyId}`, { responseType: 'blob' })
  }
}

export const roleApi = {
  list(companyId, pageNum, pageSize, name) {
    return instance.get('/roles', { params: { companyId, pageNum, pageSize, name } })
  },
  getByCompanyId(companyId) {
    return instance.get(`/roles/company/${companyId}`)
  },
  getById(id) {
    return instance.get(`/roles/${id}`)
  },
  getPermissions(id) {
    return instance.get(`/roles/${id}/permissions`)
  },
  create(data) {
    return instance.post('/roles', data)
  },
  update(id, data) {
    return instance.put(`/roles/${id}`, data)
  },
  delete(id) {
    return instance.delete(`/roles/${id}`)
  }
}

export const permissionApi = {
  list(pageNum, pageSize, name) {
    return instance.get('/permissions', { params: { pageNum, pageSize, name } })
  },
  getAll() {
    return instance.get('/permissions/all')
  },
  getById(id) {
    return instance.get(`/permissions/${id}`)
  },
  create(data) {
    return instance.post('/permissions', data)
  },
  update(id, data) {
    return instance.put(`/permissions/${id}`, data)
  },
  delete(id) {
    return instance.delete(`/permissions/${id}`)
  }
}

export const attendanceApi = {
  list(companyId, pageNum, pageSize, startDate, endDate, employeeId) {
    return instance.get('/attendance', { params: { companyId, pageNum, pageSize, startDate, endDate, employeeId } })
  },
  getById(id) {
    return instance.get(`/attendance/${id}`)
  },
  create(data) {
    return instance.post('/attendance', data)
  },
  update(id, data) {
    return instance.put(`/attendance/${id}`, data)
  },
  delete(id) {
    return instance.delete(`/attendance/${id}`)
  },
  export(companyId, startDate, endDate) {
    let url = `/attendance/export?companyId=${companyId}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`
    return instance.get(url, { responseType: 'blob' })
  }
}

export const salaryApi = {
  list(companyId, pageNum, pageSize, salaryMonth, employeeId) {
    return instance.get('/salary', { params: { companyId, pageNum, pageSize, salaryMonth, employeeId } })
  },
  getById(id) {
    return instance.get(`/salary/${id}`)
  },
  create(data) {
    return instance.post('/salary', data)
  },
  update(id, data) {
    return instance.put(`/salary/${id}`, data)
  },
  delete(id) {
    return instance.delete(`/salary/${id}`)
  },
  pay(companyId, salaryMonth) {
    return instance.post(`/salary/pay?companyId=${companyId}&salaryMonth=${salaryMonth}`)
  },
  export(companyId, salaryMonth) {
    let url = `/salary/export?companyId=${companyId}`
    if (salaryMonth) url += `&salaryMonth=${salaryMonth}`
    return instance.get(url, { responseType: 'blob' })
  }
}

export const logApi = {
  list(companyId, pageNum, pageSize, startTime, endTime, module) {
    return instance.get('/logs', { params: { companyId, pageNum, pageSize, startTime, endTime, module } })
  },
  export(companyId, startTime, endTime) {
    let url = `/logs/export?companyId=${companyId}`
    if (startTime) url += `&startTime=${startTime}`
    if (endTime) url += `&endTime=${endTime}`
    return instance.get(url, { responseType: 'blob' })
  }
}

export const fileApi = {
  uploadAvatar(file) {
    const formData = new FormData()
    formData.append('file', file)
    return instance.post('/files/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}