import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { 
        requiresAuth: false,
        hideForAuth: true 
      }
    },
    {
      path: '/register',
      name: 'Register', 
      component: () => import('@/views/auth/Register.vue'),
      meta: { 
        requiresAuth: false,
        hideForAuth: true 
      }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/projects',
      name: 'Projects',
      component: () => import('@/views/projects/ProjectList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/projects/create',
      name: 'CreateProject',
      component: () => import('@/views/projects/CreateProject.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/projects/:id',
      name: 'ProjectDetail',
      component: () => import('@/views/projects/ProjectDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/projects/:id/requirements',
      name: 'ProjectRequirements',
      component: () => import('@/views/projects/ProjectRequirements.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/documents/:projectId',
      name: 'Documents',
      component: () => import('@/views/documents/DocumentList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/documents/view/:documentId',
      name: 'DocumentView',
      component: () => import('@/views/documents/DocumentView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫
router.beforeEach((to) => {
  const authStore = useAuthStore()
  
  // 需要认证的路由
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }
  
  // 已登录用户访问登录/注册页面，重定向到首页
  if (to.meta.hideForAuth && authStore.isAuthenticated) {
    return '/dashboard'
  }
})

export default router