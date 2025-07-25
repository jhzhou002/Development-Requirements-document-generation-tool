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
            @click="$router.push(`/projects/${$route.params.id}`)"
            class="back-btn"
          >
            <el-icon><ArrowLeft /></el-icon>
            返回项目详情
          </el-button>
          <h1 class="page-title">配置项目需求</h1>
        </div>
        <div class="header-actions">
          <el-button @click="handleSaveRequirements" :loading="saving">
            <el-icon><DocumentChecked /></el-icon>
            保存需求
          </el-button>
        </div>
      </div>

      <div class="requirements-content">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <div v-else class="requirements-form">
          <!-- 功能需求 -->
          <div class="content-card">
            <div class="card-header">
              <h3 class="card-title">
                <el-icon><Star /></el-icon>
                核心功能需求
              </h3>
            </div>
            <div class="card-body">
              <div class="requirement-section">
                <el-form-item label="主要功能模块">
                  <el-checkbox-group v-model="requirements.features">
                    <el-checkbox label="用户管理">用户管理</el-checkbox>
                    <el-checkbox label="权限控制">权限控制</el-checkbox>
                    <el-checkbox label="数据分析">数据分析</el-checkbox>
                    <el-checkbox label="文件上传">文件上传</el-checkbox>
                    <el-checkbox label="支付功能">支付功能</el-checkbox>
                    <el-checkbox label="消息通知">消息通知</el-checkbox>
                    <el-checkbox label="搜索功能">搜索功能</el-checkbox>
                    <el-checkbox label="缓存优化">缓存优化</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item label="功能详细描述">
                  <el-input
                    v-model="requirements.feature_description"
                    type="textarea"
                    :rows="4"
                    placeholder="请详细描述项目的核心功能和预期效果"
                  />
                  <div class="optimize-actions">
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="optimizeText('feature_description')"
                      :loading="optimizing.feature_description"
                    >
                      <el-icon><MagicStick /></el-icon>
                      一键优化
                    </el-button>
                  </div>
                </el-form-item>
              </div>
            </div>
          </div>

          <!-- 用户界面需求 -->
          <div class="content-card">
            <div class="card-header">
              <h3 class="card-title">
                <el-icon><Monitor /></el-icon>
                用户界面需求
              </h3>
            </div>
            <div class="card-body">
              <div class="requirement-section">
                <el-form-item label="UI设计风格">
                  <el-radio-group v-model="requirements.ui_style">
                    <el-radio label="现代简约">现代简约</el-radio>
                    <el-radio label="商务专业">商务专业</el-radio>
                    <el-radio label="活泼可爱">活泼可爱</el-radio>
                    <el-radio label="科技感">科技感</el-radio>
                    <el-radio label="传统经典">传统经典</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="界面布局偏好">
                  <el-checkbox-group v-model="requirements.layout_preferences">
                    <el-checkbox label="响应式设计">响应式设计</el-checkbox>
                    <el-checkbox label="移动端优先">移动端优先</el-checkbox>
                    <el-checkbox label="暗黑模式支持">暗黑模式支持</el-checkbox>
                    <el-checkbox label="多语言支持">多语言支持</el-checkbox>
                    <el-checkbox label="无障碍访问">无障碍访问</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item label="界面设计要求">
                  <el-input
                    v-model="requirements.ui_requirements"
                    type="textarea"
                    :rows="3"
                    placeholder="请描述具体的界面设计要求和用户体验期望"
                  />
                  <div class="optimize-actions">
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="optimizeText('ui_requirements')"
                      :loading="optimizing.ui_requirements"
                    >
                      <el-icon><MagicStick /></el-icon>
                      一键优化
                    </el-button>
                  </div>
                </el-form-item>
              </div>
            </div>
          </div>

          <!-- 技术规格需求 -->
          <div class="content-card">
            <div class="card-header">
              <h3 class="card-title">
                <el-icon><Setting /></el-icon>
                技术规格需求
              </h3>
            </div>
            <div class="card-body">
              <div class="requirement-section">
                <el-form-item label="性能要求">
                  <el-checkbox-group v-model="requirements.performance_requirements">
                    <el-checkbox label="高并发支持">高并发支持</el-checkbox>
                    <el-checkbox label="快速响应">快速响应(< 2秒)</el-checkbox>
                    <el-checkbox label="离线功能">离线功能</el-checkbox>
                    <el-checkbox label="实时数据">实时数据同步</el-checkbox>
                    <el-checkbox label="大数据处理">大数据处理</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item label="安全要求">
                  <el-checkbox-group v-model="requirements.security_requirements">
                    <el-checkbox label="数据加密">数据加密</el-checkbox>
                    <el-checkbox label="访问控制">访问控制</el-checkbox>
                    <el-checkbox label="日志审计">日志审计</el-checkbox>
                    <el-checkbox label="备份恢复">备份恢复</el-checkbox>
                    <el-checkbox label="防护攻击">防护攻击</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item label="技术约束说明">
                  <el-input
                    v-model="requirements.technical_constraints"
                    type="textarea"
                    :rows="3"
                    placeholder="请说明项目的技术约束、兼容性要求等"
                  />
                  <div class="optimize-actions">
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="optimizeText('technical_constraints')"
                      :loading="optimizing.technical_constraints"
                    >
                      <el-icon><MagicStick /></el-icon>
                      一键优化
                    </el-button>
                  </div>
                </el-form-item>
              </div>
            </div>
          </div>

          <!-- 业务流程 -->
          <div class="content-card">
            <div class="card-header">
              <h3 class="card-title">
                <el-icon><Connection /></el-icon>
                业务流程需求
              </h3>
            </div>
            <div class="card-body">
              <div class="requirement-section">
                <el-form-item label="核心业务流程">
                  <el-input
                    v-model="requirements.business_process"
                    type="textarea"
                    :rows="4"
                    placeholder="请描述项目的核心业务流程和用户使用路径"
                  />
                  <div class="optimize-actions">
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="optimizeText('business_process')"
                      :loading="optimizing.business_process"
                    >
                      <el-icon><MagicStick /></el-icon>
                      一键优化
                    </el-button>
                  </div>
                </el-form-item>

                <el-form-item label="异常处理需求">
                  <el-input
                    v-model="requirements.exception_handling"
                    type="textarea"
                    :rows="3"
                    placeholder="请描述异常情况的处理方案和容错机制"
                  />
                  <div class="optimize-actions">
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="optimizeText('exception_handling')"
                      :loading="optimizing.exception_handling"
                    >
                      <el-icon><MagicStick /></el-icon>
                      一键优化
                    </el-button>
                  </div>
                </el-form-item>
              </div>
            </div>
          </div>

          <!-- 保存操作 -->
          <div class="save-section">
            <el-button @click="$router.go(-1)">取消</el-button>
            <el-button 
              type="primary" 
              @click="handleSaveRequirements"
              :loading="saving"
            >
              保存需求配置
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { projectAPI, aiAPI } from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const saving = ref(false)

const optimizing = reactive({
  feature_description: false,
  ui_requirements: false,
  technical_constraints: false,
  business_process: false,
  exception_handling: false
})

const requirements = reactive({
  features: [],
  feature_description: '',
  ui_style: '',
  layout_preferences: [],
  ui_requirements: '',
  performance_requirements: [],
  security_requirements: [],
  technical_constraints: '',
  business_process: '',
  exception_handling: ''
})

// 获取项目需求
const fetchRequirements = async () => {
  loading.value = true
  try {
    const response = await projectAPI.getProject(route.params.id)
    if (response.success && response.data.requirements) {
      // 将现有需求填充到表单中
      const existingReqs = response.data.requirements
      existingReqs.forEach(req => {
        if (req.field_type === 'multi_select' && req.field_value) {
          requirements[req.field_name] = JSON.parse(req.field_value)
        } else {
          requirements[req.field_name] = req.field_value || ''
        }
      })
    }
  } catch (error) {
    console.error('获取需求失败:', error)
    ElMessage.error('获取需求失败')
  } finally {
    loading.value = false
  }
}

// 优化文本
const optimizeText = async (fieldName) => {
  const text = requirements[fieldName]
  if (!text || !text.trim()) {
    ElMessage.warning('请先输入内容再进行优化')
    return
  }

  optimizing[fieldName] = true
  try {
    const response = await aiAPI.optimizeText({
      text,
      optimization_type: getOptimizationType(fieldName),
      project_id: parseInt(route.params.id)
    })

    if (response.success) {
      requirements[fieldName] = response.data.optimized_text
      ElMessage.success('文本优化完成')
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    console.error('文本优化失败:', error)
    ElMessage.error('文本优化失败')
  } finally {
    optimizing[fieldName] = false
  }
}

// 获取优化类型
const getOptimizationType = (fieldName) => {
  const typeMap = {
    feature_description: 'feature_description',
    ui_requirements: 'requirement',
    technical_constraints: 'technical_spec',
    business_process: 'user_story',
    exception_handling: 'requirement'
  }
  return typeMap[fieldName] || 'requirement'
}

// 保存需求
const handleSaveRequirements = async () => {
  saving.value = true
  try {
    // 转换需求数据格式
    const requirementsList = []

    // 处理各个需求字段
    Object.entries(requirements).forEach(([fieldName, fieldValue]) => {
      if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
        const fieldType = Array.isArray(fieldValue) ? 'multi_select' : 
                         (fieldValue.length > 100 ? 'textarea' : 'text')
        
        requirementsList.push({
          category: getFieldCategory(fieldName),
          field_name: fieldName,
          field_value: Array.isArray(fieldValue) ? JSON.stringify(fieldValue) : fieldValue,
          field_type: fieldType,
          is_optimized: false
        })
      }
    })

    const response = await projectAPI.updateRequirements(route.params.id, requirementsList)
    
    if (response.success) {
      ElMessage.success('需求保存成功')
      router.push(`/projects/${route.params.id}`)
    } else {
      ElMessage.error(response.message)
    }
  } catch (error) {
    console.error('保存需求失败:', error)
    ElMessage.error('保存需求失败')
  } finally {
    saving.value = false
  }
}

// 获取字段分类
const getFieldCategory = (fieldName) => {
  const categoryMap = {
    features: 'features',
    feature_description: 'features',
    ui_style: 'ui',
    layout_preferences: 'ui',
    ui_requirements: 'ui',
    performance_requirements: 'technical',
    security_requirements: 'technical',
    technical_constraints: 'technical',
    business_process: 'business',
    exception_handling: 'business'
  }
  return categoryMap[fieldName] || 'other'
}

// 用户下拉菜单处理
const handleCommand = (command) => {
  if (command === 'logout') {
    authStore.logout()
    router.push('/login')
    ElMessage.success('退出登录成功')
  }
}

onMounted(() => {
  fetchRequirements()
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

.header-actions {
  display: flex;
  gap: 12px;
}

.requirements-content {
  padding: 0 24px;
  max-width: 1000px;
}

.loading-container {
  padding: 40px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.requirement-section {
  max-width: 800px;
}

.optimize-actions {
  margin-top: 8px;
  text-align: right;
}

.el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.el-checkbox {
  margin-right: 0;
  margin-bottom: 8px;
}

.el-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.el-radio {
  margin-right: 0;
}

.save-section {
  text-align: right;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.save-section .el-button {
  margin-left: 16px;
}
</style>