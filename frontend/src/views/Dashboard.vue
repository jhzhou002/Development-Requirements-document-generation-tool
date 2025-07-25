<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>文档生成工具</h2>
      </div>
      
      <el-menu
        :default-active="$route.path"
        class="sidebar-menu"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-menu-item>
        
        <el-menu-item index="/projects">
          <el-icon><Folder /></el-icon>
          <span>我的项目</span>
        </el-menu-item>
        
        <el-menu-item index="/projects/create">
          <el-icon><Plus /></el-icon>
          <span>创建项目</span>
        </el-menu-item>
      </el-menu>
      
      <div class="sidebar-footer">
        <el-dropdown @command="handleCommand">
          <div class="user-info">
            <el-icon><User /></el-icon>
            <span>{{ authStore.user?.username || '用户' }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="page-header">
        <h1 class="page-title">项目概览</h1>
        <p class="page-subtitle">管理你的需求文档生成项目</p>
      </div>

      <div class="dashboard-content">
        <!-- 统计卡片 -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon color="#409eff"><Folder /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ projectStats.total }}</div>
              <div class="stat-label">总项目数</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <el-icon color="#67c23a"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ projectStats.completed }}</div>
              <div class="stat-label">已完成项目</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <el-icon color="#e6a23c"><EditPen /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ projectStats.draft }}</div>
              <div class="stat-label">草稿项目</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <el-icon color="#f56c6c"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ projectStats.thisMonth }}</div>
              <div class="stat-label">本月新建</div>
            </div>
          </div>
        </div>

        <!-- 最近项目 -->
        <div class="content-card">
          <div class="card-header">
            <h3 class="card-title">最近项目</h3>
            <el-button type="primary" @click="$router.push('/projects/create')">
              <el-icon><Plus /></el-icon>
              新建项目
            </el-button>
          </div>

          <div class="card-body">
            <div v-if="recentProjects.length === 0" class="empty-state">
              <el-empty description="暂无项目">
                <el-button type="primary" @click="$router.push('/projects/create')">
                  创建第一个项目
                </el-button>
              </el-empty>
            </div>

            <div v-else class="project-list">
              <div
                v-for="project in recentProjects"
                :key="project.id"
                class="project-item"
                @click="$router.push(`/projects/${project.id}`)"
              >
                <div class="project-info">
                  <h4 class="project-name">{{ project.name }}</h4>
                  <p class="project-desc">{{ project.description || '暂无描述' }}</p>
                  <div class="project-meta">
                    <span class="project-type">{{ project.project_type }}</span>
                    <span :class="`project-status status-${project.status}`">
                      {{ getStatusText(project.status) }}
                    </span>
                  </div>
                </div>
                <div class="project-actions">
                  <el-button
                    type="text"
                    @click.stop="$router.push(`/projects/${project.id}/requirements`)"
                  >
                    编辑需求
                  </el-button>
                  <el-button
                    type="text"
                    @click.stop="$router.push(`/documents/${project.id}`)"
                  >
                    查看文档
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { projectAPI } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const projects = ref([])
const loading = ref(false)

// 计算统计数据
const projectStats = computed(() => {
  const total = projects.value.length
  const completed = projects.value.filter(p => p.status === 'completed').length
  const draft = projects.value.filter(p => p.status === 'draft').length
  
  // 计算本月新建项目数
  const thisMonth = projects.value.filter(p => {
    const createdDate = new Date(p.created_at)
    const now = new Date()
    return createdDate.getMonth() === now.getMonth() && 
           createdDate.getFullYear() === now.getFullYear()
  }).length

  return { total, completed, draft, thisMonth }
})

// 最近的5个项目
const recentProjects = computed(() => {
  return projects.value.slice(0, 5)
})

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    draft: '草稿',
    completed: '已完成', 
    archived: '已归档'
  }
  return statusMap[status] || status
}

// 获取项目列表
const fetchProjects = async () => {
  loading.value = true
  try {
    const response = await projectAPI.getProjects()
    if (response.success) {
      projects.value = response.data
    }
  } catch (error) {
    console.error('获取项目列表失败:', error)
    ElMessage.error('获取项目列表失败')
  } finally {
    loading.value = false
  }
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'logout') {
    authStore.logout()
    router.push('/login')
    ElMessage.success('退出登录成功')
  }
}

onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.sidebar-header h2 {
  color: #303133;
  font-size: 18px;
  margin: 0;
}

.sidebar-menu {
  border: none;
}

.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  border-top: 1px solid #e4e7ed;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-info span {
  margin-left: 8px;
  color: #303133;
}

.dashboard-content {
  padding: 0 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 24px;
  margin-right: 16px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.project-list {
  space-y: 16px;
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.project-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.project-item + .project-item {
  margin-top: 16px;  
}

.project-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 8px 0;
}

.project-desc {
  color: #606266;
  font-size: 14px;
  margin: 0 0 12px 0;
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-type {
  background: #f0f2f5;
  color: #606266;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.project-actions {
  display: flex;
  gap: 8px;
}
</style>