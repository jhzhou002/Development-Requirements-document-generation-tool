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
        <h1 class="page-title">我的项目</h1>
        <p class="page-subtitle">管理你的所有需求文档项目</p>
        <div class="header-actions">
          <el-button type="primary" @click="$router.push('/projects/create')">
            <el-icon><Plus /></el-icon>
            新建项目
          </el-button>
        </div>
      </div>

      <div class="projects-content">
        <!-- 搜索和筛选 -->
        <div class="content-card">
          <div class="card-body">
            <div class="search-section">
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-input
                    v-model="searchKeyword"
                    placeholder="搜索项目名称"
                    prefix-icon="Search"
                    @input="handleSearch"
                  />
                </el-col>
                <el-col :span="6">
                  <el-select
                    v-model="filterStatus"
                    placeholder="项目状态"
                    @change="handleFilter"
                  >
                    <el-option label="全部状态" value="" />
                    <el-option label="草稿" value="draft" />
                    <el-option label="已完成" value="completed" />
                    <el-option label="已归档" value="archived" />
                  </el-select>
                </el-col>
                <el-col :span="6">
                  <el-select
                    v-model="filterType"
                    placeholder="项目类型"
                    @change="handleFilter"
                  >
                    <el-option label="全部类型" value="" />
                    <el-option label="Web应用" value="web" />
                    <el-option label="移动应用" value="mobile" />
                    <el-option label="桌面应用" value="desktop" />
                    <el-option label="API接口" value="api" />
                    <el-option label="其他" value="other" />
                  </el-select>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>

        <!-- 项目列表 -->
        <div class="content-card">
          <div class="card-body">
            <div v-if="loading" class="loading-state">
              <el-skeleton :rows="3" animated />
            </div>

            <div v-else-if="filteredProjects.length === 0" class="empty-state">
              <el-empty description="暂无项目">
                <el-button type="primary" @click="$router.push('/projects/create')">
                  创建第一个项目
                </el-button>
              </el-empty>
            </div>

            <div v-else class="projects-grid">
              <div
                v-for="project in filteredProjects"
                :key="project.id"
                class="project-card"
                @click="$router.push(`/projects/${project.id}`)"
              >
                <div class="project-header">
                  <h3 class="project-name">{{ project.name }}</h3>
                  <el-dropdown @command="(command) => handleProjectAction(command, project)">
                    <el-button type="text" @click.stop="">
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="edit">编辑</el-dropdown-item>
                        <el-dropdown-item command="requirements">配置需求</el-dropdown-item>
                        <el-dropdown-item command="documents">查看文档</el-dropdown-item>
                        <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>

                <p class="project-description">
                  {{ project.description || '暂无描述' }}
                </p>

                <div class="project-meta">
                  <div class="meta-item">
                    <el-tag :type="getProjectTypeTag(project.project_type)">
                      {{ getProjectTypeText(project.project_type) }}
                    </el-tag>
                  </div>
                  <div class="meta-item">
                    <span :class="`project-status status-${project.status}`">
                      {{ getStatusText(project.status) }}
                    </span>
                  </div>
                </div>

                <div class="project-footer">
                  <div class="project-time">
                    <el-icon><Clock /></el-icon>
                    <span>{{ formatDate(project.updated_at) }}</span>
                  </div>
                  <div class="project-actions">
                    <el-button
                      type="text"
                      size="small"
                      @click.stop="$router.push(`/projects/${project.id}/requirements`)"
                    >
                      编辑需求
                    </el-button>
                    <el-button
                      type="text"
                      size="small"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { projectAPI } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const projects = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const filterStatus = ref('')
const filterType = ref('')

// 过滤后的项目列表
const filteredProjects = computed(() => {
  let filtered = projects.value

  // 关键词搜索
  if (searchKeyword.value) {
    filtered = filtered.filter(project => 
      project.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchKeyword.value.toLowerCase()))
    )
  }

  // 状态筛选
  if (filterStatus.value) {
    filtered = filtered.filter(project => project.status === filterStatus.value)
  }

  // 类型筛选
  if (filterType.value) {
    filtered = filtered.filter(project => project.project_type === filterType.value)
  }

  return filtered
})

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

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑在计算属性中处理
}

// 筛选处理
const handleFilter = () => {
  // 筛选逻辑在计算属性中处理
}

// 项目操作处理
const handleProjectAction = async (command, project) => {
  switch (command) {
    case 'edit':
      router.push(`/projects/${project.id}`)
      break
    case 'requirements':
      router.push(`/projects/${project.id}/requirements`)
      break
    case 'documents':
      router.push(`/documents/${project.id}`)
      break
    case 'delete':
      await handleDeleteProject(project)
      break
  }
}

// 删除项目
const handleDeleteProject = async (project) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目"${project.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await projectAPI.deleteProject(project.id)
    if (response.success) {
      ElMessage.success('项目删除成功')
      await fetchProjects() // 重新加载项目列表
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除项目失败:', error)
      ElMessage.error('删除项目失败')
    }
  }
}

// 用户下拉菜单处理
const handleCommand = (command) => {
  if (command === 'logout') {
    authStore.logout()
    router.push('/login')
    ElMessage.success('退出登录成功')
  }
}

// 获取项目类型文本
const getProjectTypeText = (type) => {
  const typeMap = {
    web: 'Web应用',
    mobile: '移动应用',
    desktop: '桌面应用',
    api: 'API接口',
    other: '其他'
  }
  return typeMap[type] || type
}

// 获取项目类型标签样式
const getProjectTypeTag = (type) => {
  const tagMap = {
    web: '',
    mobile: 'success',
    desktop: 'info',
    api: 'warning',
    other: 'danger'
  }
  return tagMap[type] || ''
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    draft: '草稿',
    completed: '已完成', 
    archived: '已归档'
  }
  return statusMap[status] || status
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString()
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

.header-actions {
  position: absolute;
  right: 24px;
  top: 16px;
}

.projects-content {
  padding: 0 24px;
}

.search-section {
  margin-bottom: 0;
}

.loading-state {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.project-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.project-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.project-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0;
  flex: 1;
}

.project-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f2f5;
}

.project-time {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 12px;
}

.project-time .el-icon {
  margin-right: 4px;
}

.project-actions {
  display: flex;
  gap: 8px;
}
</style>