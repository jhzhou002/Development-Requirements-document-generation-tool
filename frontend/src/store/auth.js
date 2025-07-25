import { defineStore } from 'pinia'
import { authAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null,
    isLoading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user
  },

  actions: {
    async login(credentials) {
      this.isLoading = true
      try {
        const response = await authAPI.login(credentials)
        
        if (response.success) {
          this.token = response.data.token
          this.user = response.data.user
          localStorage.setItem('token', this.token)
          
          return { success: true }
        } else {
          return { success: false, message: response.message }
        }
      } catch (error) {
        console.error('登录失败:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || '登录失败' 
        }
      } finally {
        this.isLoading = false
      }
    },

    async register(userData) {
      this.isLoading = true
      try {
        const response = await authAPI.register(userData)
        
        if (response.success) {
          return { success: true, message: '注册成功' }
        } else {
          return { success: false, message: response.message }
        }
      } catch (error) {
        console.error('注册失败:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || '注册失败' 
        }
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    },

    // 初始化用户信息（页面刷新时调用）
    initializeAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        // 可以在这里调用API获取用户信息
      }
    }
  }
})