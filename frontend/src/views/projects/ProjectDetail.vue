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
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="project" class="project-detail">
        <div class="page-header">
          <div class="header-left">
            <el-button 
              type="text" 
              @click="$router.push('/projects')"
              class="back-btn"
            >
              <el-icon><ArrowLeft /></el-icon>
              返回项目列表
            </el-button>
            <h1 class="page-title">{{ project.name }}</h1>
            <span :class="`project-status status-${project.status}`">
              {{ getStatusText(project.status) }}
            </span>
          </div>
          <div class="header-actions">
            <el-button @click="$router.push(`/projects/${project.id}/requirements`)">
              <el-icon><EditPen /></el-icon>
              编辑需求
            </el-button>
            <el-button type="primary" @click="$router.push(`/documents/${project.id}`)">
              <el-icon><Document /></el-icon>
              查看文档
            </el-button>
          </div>
        </div>

        <div class="detail-content">
          <!-- 项目概览 -->
          <div class="content-card">
            <div class="card-header">
              <h3 class="card-title">项目概览</h3>
              <el-button type="text" @click="editMode = !editMode">
                <el-icon><Edit /></el-icon>
                {{ editMode ? '取消编辑' : '编辑信息' }}
              </el-button>
            </div>
            <div class="card-body">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="项目名称">
                  <template v-if="editMode">
                    <el-input v-model="editForm.name" />
                  </template>
                  <template v-else>
                    {{ project.name }}
                  </template>
                </el-descriptions-item>
                <el-descriptions-item label="项目类型">
                  <template v-if="editMode">
                    <el-select v-model="editForm.project_type">
                      <el-option label="Web应用" value="web" />
                      <el-option label="移动应用" value="mobile" />
                      <el-option label="桌面应用" value="desktop" />
                      <el-option label="API接口" value="api" />
                      <el-option label="其他" value="other" />
                    </el-select>
                  </template>
                  <template v-else>
                    <el-tag :type="getProjectTypeTag(project.project_type)">
                      {{ getProjectTypeText(project.project_type) }}
                    </el-tag>
                  </template>
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">
                  {{ formatDate(project.created_at) }}
                </el-descriptions-item>
                <el-descriptions-item label="更新时间">
                  {{ formatDate(project.updated_at) }}
                </el-descriptions-item>
                <el-descriptions-item label="项目描述" :span="2">
                  <template v-if="editMode">
                    <el-input
                      v-model="editForm.description"
                      type="textarea"
                      :rows="3"
                    />
                  </template>
                  <template v-else>
                    {{ project.description || '暂无描述' }}
                  </template>
                </el-descriptions-item>
              </el-descriptions>
              
              <div v-if="editMode" class="edit-actions">
                <el-button @click="editMode = false">取消</el-button>
                <el-button type="primary" @click="handleUpdateProject">
                  保存修改
                </el-button>
              </div>
            </div>
          </div>

          <!-- 技术栈 -->
          <div class="content-card">
            <div class="card-header">
              <h3 class="card-title">技术栈</h3>
            </div>
            <div class="card-body">
              <div v-if="Object.keys(project.tech_stack || {}).length === 0" class="empty-state">
                <el-empty description="暂未配置技术栈" :image-size="80" />
              </div>
              <div v-else class="tech-stack-grid">
                <div
                  v-for="(value, key) in project.tech_stack"
                  :key="key"
                  class="tech-item"
                >
                  <div class="tech-label">{{ getTechLabel(key) }}</div>
                  <div class="tech-value">{{ value || '未设置' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 需求配置 -->
          <div class="content-card">
            <div class="card-header">
              <h3 class="card-title">需求配置</h3>
              <el-button 
                type="primary" 
                @click="$router.push(`/projects/${project.id}/requirements`)"
              >
                <el-icon><Plus /></el-icon>
                配置需求
              </el-button>
            </div>
            <div class="card-body">
              <div v-if="requirements.length === 0" class="empty-state">
                <el-empty description="暂未配置需求">
                  <el-button 
                    type="primary" 
                    @click="$router.push(`/projects/${project.id}/requirements`)"
                  >
                    开始配置需求
                  </el-button>
                </el-empty>
              </div>
              <div v-else class="requirements-summary">
                <div class="summary-stats">
                  <div class="stat-item">
                    <div class="stat-number">{{ requirementStats.total }}</div>
                    <div class="stat-label">总需求项</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ requirementStats.optimized }}</div>
                    <div class="stat-label">已优化</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">{{ requirementStats.categories }}</div>
                    <div class="stat-label">需求分类</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 快速操作 -->
          <div class="content-card">
            <div class="card-header">
              <h3 class="card-title">快速操作</h3>
            </div>
            <div class="card-body">
              <div class="quick-actions">
                <el-button 
                  type="primary" 
                  @click="generateRequirementDoc"
                  :loading="generating.requirement"
                >
                  <el-icon><Document /></el-icon>
                  生成需求文档
                </el-button>
                <el-button 
                  type="success" 
                  @click="generateDevelopmentDoc"
                  :loading="generating.development"
                >
                  <el-icon><DocumentCopy /></el-icon>
                  生成开发文档
                </el-button>
                <el-button @click="$router.push(`/documents/${project.id}`)">
                  <el-icon><FolderOpened /></el-icon>
                  查看所有文档
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="error-state">
        <el-result
          icon="error"
          title="项目不存在"
          sub-title="请检查项目ID是否正确"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/projects')">
              返回项目列表
            </el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { projectAPI, documentAPI } from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const project = ref(null)
const requirements = ref([])
const loading = ref(false)
const editMode = ref(false)
const generating = reactive({
  requirement: false,
  development: false
})

const editForm = reactive({
  name: '',
  description: '',
  project_type: ''
})

// 需求统计
const requirementStats = computed(() => {
  const total = requirements.value.length
  const optimized = requirements.value.filter(req => req.is_optimized).length
  const categories = new Set(requirements.value.map(req => req.category)).size
  
  return { total, optimized, categories }
})

// 获取项目详情
const fetchProjectDetail = async () => {
  loading.value = true
  try {
    const response = await projectAPI.getProject(route.params.id)
    if (response.success) {
      project.value = response.data.project
      requirements.value = response.data.requirements || []
      
      // 初始化编辑表单
      editForm.name = project.value.name
      editForm.description = project.value.description
      editForm.project_type = project.value.project_type
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    console.error('获取项目详情失败:', error)
    ElMessage.error('获取项目详情失败')
  } finally {
    loading.value = false
  }
}

// 更新项目信息
const handleUpdateProject = async () => {
  try {
    const response = await projectAPI.updateProject(project.value.id, editForm)
    if (response.success) {
      ElMessage.success('项目信息更新成功')
      editMode.value = false
      await fetchProjectDetail() // 重新获取项目详情
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    console.error('更新项目失败:', error)
    ElMessage.error('更新项目失败')
  }
}

// 生成需求文档
const generateRequirementDoc = async () => {
  generating.requirement = true
  try {
    const response = await documentAPI.generateRequirementDoc(project.value.id)
    if (response.success) {
      ElMessage.success('需求文档生成成功')
      router.push(`/documents/view/${response.data.documentId}`)
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    console.error('生成需求文档失败:', error)
    ElMessage.error('生成需求文档失败')
  } finally {
    generating.requirement = false
  }
}

// 生成开发文档
const generateDevelopmentDoc = async () => {
  generating.development = true
  try {
    const response = await documentAPI.generateDevelopmentDoc(project.value.id)
    if (response.success) {
      ElMessage.success('开发文档生成成功')
      router.push(`/documents/view/${response.data.documentId}`)
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    console.error('生成开发文档失败:', error)
    ElMessage.error('生成开发文档失败')
  } finally {
    generating.development = false
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

// 获取技术栈标签
const getTechLabel = (key) => {
  const labelMap = {
    frontend: '前端技术',
    backend: '后端技术',
    database: '数据库',
    deployment: '部署方式',
    team_size: '团队规模',
    timeline: '开发周期'
  }
  return labelMap[key] || key
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  fetchProjectDetail()
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

.loading-container {
  padding: 24px;
}

.project-detail {
  flex: 1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  color: #409eff;
  padding: 0;
}

.page-title {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.detail-content {
  padding: 0 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-actions {
  margin-top: 16px;
  text-align: right;
}

.tech-stack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.tech-item {
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.tech-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.tech-value {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.summary-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.quick-actions {
  display: flex;
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}
</style>