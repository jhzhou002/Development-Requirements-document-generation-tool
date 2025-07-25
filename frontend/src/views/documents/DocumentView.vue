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
        <el-skeleton :rows="8" animated />
      </div>

      <div v-else-if="document" class="document-view">
        <div class="page-header">
          <div class="header-left">
            <el-button 
              type="text" 
              @click="goBack"
              class="back-btn"
            >
              <el-icon><ArrowLeft /></el-icon>
              返回文档列表
            </el-button>
            <h1 class="page-title">{{ document.title }}</h1>
            <div class="document-meta">
              <el-tag :type="getDocumentTypeTag(document.document_type)">
                {{ getDocumentTypeText(document.document_type) }}
              </el-tag>
              <span class="version">版本 {{ document.version }}</span>
              <span class="create-time">{{ formatDate(document.created_at) }}</span>
            </div>
          </div>
          <div class="header-actions">
            <el-button @click="copyContent">
              <el-icon><DocumentCopy /></el-icon>
              复制内容
            </el-button>
            <el-button @click="downloadDocument">
              <el-icon><Download /></el-icon>
              下载文档
            </el-button>
            <el-dropdown @command="handleMoreAction">
              <el-button>
                更多操作
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑项目</el-dropdown-item>
                  <el-dropdown-item command="regenerate">重新生成</el-dropdown-item>
                  <el-dropdown-item command="share" divided>分享文档</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div class="document-content">
          <!-- 切换视图模式 -->
          <div class="view-mode-switcher">
            <el-radio-group v-model="viewMode" @change="handleViewModeChange">
              <el-radio-button label="preview">预览模式</el-radio-button>
              <el-radio-button label="markdown">Markdown源码</el-radio-button>
              <el-radio-button label="split">分屏模式</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 预览模式 -->
          <div v-if="viewMode === 'preview'" class="content-card">
            <div class="card-body">
              <div class="document-preview" v-html="document.html"></div>
            </div>
          </div>

          <!-- Markdown源码模式 -->
          <div v-else-if="viewMode === 'markdown'" class="content-card">
            <div class="card-body">
              <div class="markdown-source">
                <pre><code>{{ document.content }}</code></pre>
              </div>
            </div>
          </div>

          <!-- 分屏模式 -->
          <div v-else class="split-view">
            <div class="split-panel">
              <div class="panel-header">
                <h4>Markdown源码</h4>
                <el-button 
                  type="text" 
                  size="small" 
                  @click="copyContent"
                >
                  <el-icon><DocumentCopy /></el-icon>
                  复制
                </el-button>
              </div>
              <div class="panel-content">
                <div class="markdown-source">
                  <pre><code>{{ document.content }}</code></pre>
                </div>
              </div>
            </div>
            
            <div class="split-divider"></div>
            
            <div class="split-panel">
              <div class="panel-header">
                <h4>预览效果</h4>
              </div>
              <div class="panel-content">
                <div class="document-preview" v-html="document.html"></div>
              </div>
            </div>
          </div>

          <!-- 文档信息 -->
          <div class="content-card document-info-card">
            <div class="card-header">
              <h3 class="card-title">文档信息</h3>
            </div>
            <div class="card-body">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="文档标题">
                  {{ document.title }}
                </el-descriptions-item>
                <el-descriptions-item label="文档类型">
                  <el-tag :type="getDocumentTypeTag(document.document_type)">
                    {{ getDocumentTypeText(document.document_type) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="版本号">
                  {{ document.version }}
                </el-descriptions-item>
                <el-descriptions-item label="是否为当前版本">
                  <el-tag v-if="document.is_current" type="success">是</el-tag>
                  <el-tag v-else type="info">否</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">
                  {{ formatFullDate(document.created_at) }}
                </el-descriptions-item>
                <el-descriptions-item label="字数统计">
                  {{ getWordCount(document.content) }} 字
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="error-state">
        <el-result
          icon="error"
          title="文档不存在"
          sub-title="请检查文档ID是否正确"
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { documentAPI } from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const document = ref(null)
const loading = ref(false)
const viewMode = ref('preview')

// 获取文档内容
const fetchDocument = async () => {
  loading.value = true
  try {
    const response = await documentAPI.getDocumentContent(route.params.documentId)
    if (response.success) {
      document.value = response.data
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    console.error('获取文档内容失败:', error)
    ElMessage.error('获取文档内容失败')
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  if (document.value && document.value.project_id) {
    router.push(`/documents/${document.value.project_id}`)
  } else {
    router.go(-1)
  }
}

// 复制内容
const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(document.value.content)
    ElMessage.success('内容已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

// 下载文档
const downloadDocument = () => {
  try {
    const blob = new Blob([document.value.content], { type: 'text/markdown' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${document.value.title}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('文档下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败')
  }
}

// 视图模式切换
const handleViewModeChange = (mode) => {
  localStorage.setItem('documentViewMode', mode)
}

// 更多操作处理
const handleMoreAction = (command) => {
  switch (command) {
    case 'edit':
      if (document.value.project_id) {
        router.push(`/projects/${document.value.project_id}`)
      }
      break
    case 'regenerate':
      ElMessage.info('重新生成功能开发中...')
      break
    case 'share':
      ElMessage.info('分享功能开发中...')
      break
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

// 获取文档类型文本
const getDocumentTypeText = (type) => {
  const typeMap = {
    requirement: '需求文档',
    development: '开发文档',
    api: 'API文档'
  }
  return typeMap[type] || type
}

// 获取文档类型标签样式
const getDocumentTypeTag = (type) => {
  const tagMap = {
    requirement: '',
    development: 'success',
    api: 'warning'
  }
  return tagMap[type] || ''
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

// 格式化完整日期
const formatFullDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

// 获取字数统计
const getWordCount = (content) => {
  if (!content) return 0
  // 简单的中文字符统计
  return content.replace(/\s/g, '').length
}

onMounted(() => {
  // 恢复上次的视图模式
  const savedMode = localStorage.getItem('documentViewMode')
  if (savedMode) {
    viewMode.value = savedMode
  }
  
  fetchDocument()
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
  padding: 40px;
}

.document-view {
  flex: 1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.back-btn {
  color: #409eff;
  padding: 0;
}

.page-title {
  margin: 0;
  font-size: 20px;
}

.document-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #909399;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.document-content {
  padding: 0 24px;
}

.view-mode-switcher {
  margin-bottom: 24px;
  text-align: center;
}

.markdown-source {
  background: #f8f9fa;
  border-radius: 8px;
  overflow: auto;
  max-height: 600px;
}

.markdown-source pre {
  margin: 0;
  padding: 20px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.split-view {
  display: flex;
  gap: 24px;
  height: 800px;
}

.split-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  background: #f5f7fa;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h4 {
  margin: 0;
  font-size: 14px;
  color: #303133;
}

.panel-content {
  flex: 1;
  overflow: auto;
  padding: 0;
}

.split-panel .markdown-source {
  height: 100%;
  max-height: none;
  border-radius: 0;
}

.split-panel .document-preview {
  padding: 20px;
  height: 100%;
  overflow: auto;
}

.split-divider {
  width: 2px;
  background: #ebeef5;
  margin: 0 -1px;
}

.document-info-card {
  margin-top: 32px;
}

.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

/* 文档预览样式继承全局样式 */
</style>