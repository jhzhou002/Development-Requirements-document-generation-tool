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
        <div class="header-left">
          <el-button 
            type="text" 
            @click="$router.push('/projects')"
            class="back-btn"
          >
            <el-icon><ArrowLeft /></el-icon>
            返回项目列表
          </el-button>
          <h1 class="page-title">项目文档</h1>
          <span v-if="projectName" class="project-name">{{ projectName }}</span>
        </div>
        <div class="header-actions">
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
        </div>
      </div>

      <div class="documents-content">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="documents.length === 0" class="empty-state">
          <el-empty description="暂无文档">
            <div class="empty-actions">
              <el-button 
                type="primary" 
                @click="generateRequirementDoc"
                :loading="generating.requirement"
              >
                生成需求文档
              </el-button>
              <el-button 
                type="success" 
                @click="generateDevelopmentDoc"
                :loading="generating.development"
              >
                生成开发文档
              </el-button>
            </div>
          </el-empty>
        </div>

        <div v-else class="documents-grid">
          <!-- 需求文档 -->
          <div class="document-section">
            <h3 class="section-title">
              <el-icon><Document /></el-icon>
              需求文档
            </h3>
            <div class="document-cards">
              <div
                v-for="doc in requirementDocs"
                :key="doc.id"
                class="document-card"
                @click="viewDocument(doc.id)"
              >
                <div class="document-header">
                  <div class="document-icon">
                    <el-icon><Document /></el-icon>
                  </div>
                  <div class="document-info">
                    <h4 class="document-title">{{ doc.title }}</h4>
                    <p class="document-meta">
                      版本 {{ doc.version }} • {{ formatDate(doc.created_at) }}
                    </p>
                  </div>
                  <div class="document-actions">
                    <el-dropdown @command="(command) => handleDocAction(command, doc)">
                      <el-button type="text" @click.stop="">
                        <el-icon><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="view">查看</el-dropdown-item>
                          <el-dropdown-item command="download">下载</el-dropdown-item>
                          <el-dropdown-item command="regenerate">重新生成</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>
                <div class="document-status">
                  <el-tag v-if="doc.is_current" type="success" size="small">
                    当前版本
                  </el-tag>
                </div>
              </div>
              
              <div 
                v-if="requirementDocs.length === 0" 
                class="generate-card"
                @click="generateRequirementDoc"
              >
                <div class="generate-content">
                  <el-icon><Plus /></el-icon>
                  <span>生成需求文档</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 开发文档 -->
          <div class="document-section">
            <h3 class="section-title">
              <el-icon><DocumentCopy /></el-icon>
              开发文档
            </h3>
            <div class="document-cards">
              <div
                v-for="doc in developmentDocs"
                :key="doc.id"
                class="document-card"
                @click="viewDocument(doc.id)"
              >
                <div class="document-header">
                  <div class="document-icon development">
                    <el-icon><DocumentCopy /></el-icon>
                  </div>
                  <div class="document-info">
                    <h4 class="document-title">{{ doc.title }}</h4>
                    <p class="document-meta">
                      版本 {{ doc.version }} • {{ formatDate(doc.created_at) }}
                    </p>
                  </div>
                  <div class="document-actions">
                    <el-dropdown @command="(command) => handleDocAction(command, doc)">
                      <el-button type="text" @click.stop="">
                        <el-icon><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="view">查看</el-dropdown-item>
                          <el-dropdown-item command="download">下载</el-dropdown-item>
                          <el-dropdown-item command="regenerate">重新生成</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>
                <div class="document-status">
                  <el-tag v-if="doc.is_current" type="success" size="small">
                    当前版本
                  </el-tag>
                </div>
              </div>
              
              <div 
                v-if="developmentDocs.length === 0" 
                class="generate-card"
                @click="generateDevelopmentDoc"
              >
                <div class="generate-content">
                  <el-icon><Plus /></el-icon>
                  <span>生成开发文档</span>
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
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { documentAPI, projectAPI } from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const documents = ref([])
const projectName = ref('')
const loading = ref(false)

const generating = reactive({
  requirement: false,
  development: false
})

// 需求文档列表
const requirementDocs = computed(() => {
  return documents.value.filter(doc => doc.document_type === 'requirement')
})

// 开发文档列表
const developmentDocs = computed(() => {
  return documents.value.filter(doc => doc.document_type === 'development')
})

// 获取文档列表
const fetchDocuments = async () => {
  loading.value = true
  try {
    const [docsResponse, projectResponse] = await Promise.all([
      documentAPI.getProjectDocuments(route.params.projectId),
      projectAPI.getProject(route.params.projectId)
    ])

    if (docsResponse.success) {
      documents.value = docsResponse.data
    }

    if (projectResponse.success) {
      projectName.value = projectResponse.data.project.name
    }
  } catch (error) {
    console.error('获取文档列表失败:', error)
    ElMessage.error('获取文档列表失败')
  } finally {
    loading.value = false
  }
}

// 查看文档
const viewDocument = (documentId) => {
  router.push(`/documents/view/${documentId}`)
}

// 生成需求文档
const generateRequirementDoc = async () => {
  generating.requirement = true
  try {
    const response = await documentAPI.generateRequirementDoc(route.params.projectId)
    if (response.success) {
      ElMessage.success('需求文档生成成功')
      await fetchDocuments() // 重新获取文档列表
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
    const response = await documentAPI.generateDevelopmentDoc(route.params.projectId)
    if (response.success) {
      ElMessage.success('开发文档生成成功')
      await fetchDocuments() // 重新获取文档列表
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

// 文档操作处理
const handleDocAction = async (command, doc) => {
  switch (command) {
    case 'view':
      viewDocument(doc.id)
      break
    case 'download':
      await downloadDocument(doc)
      break
    case 'regenerate':
      await regenerateDocument(doc)
      break
  }
}

// 下载文档
const downloadDocument = async (doc) => {
  try {
    const response = await documentAPI.getDocumentContent(doc.id)
    if (response.success) {
      // 创建下载链接
      const blob = new Blob([response.data.content], { type: 'text/markdown' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${doc.title}.md`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      ElMessage.success('文档下载成功')
    }
  } catch (error) {
    console.error('下载文档失败:', error)
    ElMessage.error('下载文档失败')
  }
}

// 重新生成文档
const regenerateDocument = async (doc) => {
  try {
    await ElMessageBox.confirm(
      `确定要重新生成"${doc.title}"吗？这将创建一个新版本。`,
      '确认重新生成',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    if (doc.document_type === 'requirement') {
      await generateRequirementDoc()
    } else if (doc.document_type === 'development') {
      await generateDevelopmentDoc()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重新生成文档失败:', error)
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
  fetchDocuments()
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

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  color: #409eff;
  padding: 0;
}

.project-name {
  color: #909399;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.documents-content {
  padding: 0 24px;
}

.loading-container {
  padding: 40px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.document-section {
  margin-bottom: 40px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: #303133;
  margin-bottom: 20px;
}

.document-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.document-card {
  background: white;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.document-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.document-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.document-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #e1f3ff;
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.document-icon.development {
  background: #f0f9ff;
  color: #67c23a;
}

.document-info {
  flex: 1;
}

.document-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.document-meta {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.document-actions {
  opacity: 0;
  transition: opacity 0.3s;
}

.document-card:hover .document-actions {
  opacity: 1;
}

.document-status {
  text-align: right;
}

.generate-card {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.generate-card:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.generate-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #909399;
}

.generate-card:hover .generate-content {
  color: #409eff;
}

.generate-content .el-icon {
  font-size: 32px;
}
</style>