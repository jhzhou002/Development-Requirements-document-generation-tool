import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API错误:', error)
    
    if (error.response?.status === 401) {
      // 未授权，清除token并跳转到登录页
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('网络错误，请稍后重试')
    }
    
    return Promise.reject(error)
  }
)

// 认证相关API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData)
}

// 项目相关API
export const projectAPI = {
  getProjects: () => api.get('/projects'),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (projectData) => api.post('/projects', projectData),
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  updateRequirements: (id, requirements) => api.put(`/projects/${id}/requirements`, { requirements })
}

// 模板相关API  
export const templateAPI = {
  getTemplates: () => api.get('/templates'),
  getTemplatesByCategory: (category) => api.get(`/templates/category/${category}`)
}

// 文档相关API
export const documentAPI = {
  generateRequirementDoc: (projectId) => api.post(`/documents/generate/${projectId}/requirement`),
  generateDevelopmentDoc: (projectId) => api.post(`/documents/generate/${projectId}/development`),
  getProjectDocuments: (projectId) => api.get(`/documents/${projectId}`),
  getDocumentContent: (documentId) => api.get(`/documents/content/${documentId}`)
}

// AI相关API
export const aiAPI = {
  optimizeText: (data) => api.post('/ai/optimize-text', data),
  getOptimizationHistory: (projectId) => api.get(`/ai/optimization-history/${projectId}`)
}

export default api