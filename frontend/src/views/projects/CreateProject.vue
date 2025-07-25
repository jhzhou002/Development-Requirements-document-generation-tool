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
        <h1 class="page-title">创建新项目</h1>
        <p class="page-subtitle">填写项目基本信息，开始生成需求文档</p>
      </div>

      <div class="create-content">
        <div class="content-card">
          <div class="card-body">
            <el-form
              ref="projectFormRef"
              :model="projectForm"
              :rules="projectRules"
              label-width="120px"
            >
              <!-- 基本信息 -->
              <div class="form-section">
                <h3 class="form-section-title">基本信息</h3>
                
                <el-form-item label="项目名称" prop="name">
                  <el-input
                    v-model="projectForm.name"
                    placeholder="请输入项目名称"
                    maxlength="100"
                    show-word-limit
                  />
                </el-form-item>

                <el-form-item label="项目描述" prop="description">
                  <el-input
                    v-model="projectForm.description"
                    type="textarea"
                    placeholder="请简要描述项目的目标和功能"
                    :rows="4"
                    maxlength="500"
                    show-word-limit
                  />
                </el-form-item>

                <el-form-item label="项目类型" prop="project_type">
                  <el-select
                    v-model="projectForm.project_type"
                    placeholder="请选择项目类型"
                    style="width: 100%"
                  >
                    <el-option label="Web应用" value="web" />
                    <el-option label="移动应用" value="mobile" />
                    <el-option label="桌面应用" value="desktop" />
                    <el-option label="API接口" value="api" />
                    <el-option label="其他" value="other" />
                  </el-select>
                </el-form-item>
              </div>

              <!-- 技术栈 -->
              <div class="form-section">
                <h3 class="form-section-title">技术栈选择</h3>
                
                <el-form-item label="前端技术">
                  <el-select
                    v-model="projectForm.tech_stack.frontend"
                    placeholder="请选择前端技术"
                    style="width: 100%"
                    clearable
                  >
                    <el-option label="Vue.js" value="Vue.js" />
                    <el-option label="React" value="React" />
                    <el-option label="Angular" value="Angular" />
                    <el-option label="原生JavaScript" value="原生JavaScript" />
                    <el-option label="jQuery" value="jQuery" />
                    <el-option label="小程序" value="小程序" />
                    <el-option label="Flutter" value="Flutter" />
                    <el-option label="React Native" value="React Native" />
                    <el-option label="其他" value="其他" />
                  </el-select>
                </el-form-item>

                <el-form-item label="后端技术">
                  <el-select
                    v-model="projectForm.tech_stack.backend"
                    placeholder="请选择后端技术"
                    style="width: 100%"
                    clearable
                  >
                    <el-option label="Node.js" value="Node.js" />
                    <el-option label="Python" value="Python" />
                    <el-option label="Java" value="Java" />
                    <el-option label="PHP" value="PHP" />
                    <el-option label="Go" value="Go" />
                    <el-option label="C#" value="C#" />
                    <el-option label="Ruby" value="Ruby" />
                    <el-option label="Rust" value="Rust" />
                    <el-option label="其他" value="其他" />
                  </el-select>
                </el-form-item>

                <el-form-item label="数据库">
                  <el-select
                    v-model="projectForm.tech_stack.database"
                    placeholder="请选择数据库"
                    style="width: 100%"
                    clearable
                  >
                    <el-option label="MySQL" value="MySQL" />
                    <el-option label="PostgreSQL" value="PostgreSQL" />
                    <el-option label="MongoDB" value="MongoDB" />
                    <el-option label="SQLite" value="SQLite" />
                    <el-option label="Redis" value="Redis" />
                    <el-option label="Oracle" value="Oracle" />
                    <el-option label="SQL Server" value="SQL Server" />
                    <el-option label="其他" value="其他" />
                  </el-select>
                </el-form-item>

                <el-form-item label="部署方式">
                  <el-select
                    v-model="projectForm.tech_stack.deployment"
                    placeholder="请选择部署方式"
                    style="width: 100%"
                    clearable
                  >
                    <el-option label="云服务器" value="云服务器" />
                    <el-option label="容器化部署" value="容器化部署" />
                    <el-option label="传统服务器" value="传统服务器" />
                    <el-option label="Serverless" value="Serverless" />
                    <el-option label="静态托管" value="静态托管" />
                    <el-option label="其他" value="其他" />
                  </el-select>
                </el-form-item>
              </div>

              <!-- 项目规模 -->
              <div class="form-section">
                <h3 class="form-section-title">项目规模</h3>
                
                <el-form-item label="团队规模">
                  <el-radio-group v-model="projectForm.tech_stack.team_size">
                    <el-radio label="小型项目(1-3人)">小型项目(1-3人)</el-radio>
                    <el-radio label="中型项目(4-10人)">中型项目(4-10人)</el-radio>
                    <el-radio label="大型项目(10+人)">大型项目(10+人)</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="开发周期">
                  <el-radio-group v-model="projectForm.tech_stack.timeline">
                    <el-radio label="1-2周">1-2周</el-radio>
                    <el-radio label="3-4周">3-4周</el-radio>
                    <el-radio label="1-2个月">1-2个月</el-radio>
                    <el-radio label="3-6个月">3-6个月</el-radio>
                    <el-radio label="6个月以上">6个月以上</el-radio>
                  </el-radio-group>
                </el-form-item>
              </div>

              <!-- 操作按钮 -->
              <div class="form-actions">
                <el-button @click="$router.go(-1)">取消</el-button>
                <el-button
                  type="primary"
                  :loading="creating"
                  @click="handleCreateProject"
                >
                  创建项目
                </el-button>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { projectAPI } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const projectFormRef = ref()
const creating = ref(false)

const projectForm = reactive({
  name: '',
  description: '',
  project_type: 'web',
  tech_stack: {
    frontend: '',
    backend: '',
    database: '',
    deployment: '',
    team_size: '',
    timeline: ''
  }
})

const projectRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 1, max: 100, message: '项目名称长度为1-100个字符', trigger: 'blur' }
  ],
  project_type: [
    { required: true, message: '请选择项目类型', trigger: 'change' }
  ]
}

// 创建项目
const handleCreateProject = async () => {
  if (!projectFormRef.value) return
  
  await projectFormRef.value.validate(async (valid) => {
    if (valid) {
      creating.value = true
      try {
        const response = await projectAPI.createProject(projectForm)
        
        if (response.success) {
          ElMessage.success('项目创建成功')
          router.push(`/projects/${response.data.projectId}`)
        } else {
          ElMessage.error(response.message)
        }
      } catch (error) {
        console.error('创建项目失败:', error)
        ElMessage.error('创建项目失败')
      } finally {
        creating.value = false
      }
    }
  })
}

// 用户下拉菜单处理
const handleCommand = (command) => {
  if (command === 'logout') {
    authStore.logout()
    router.push('/login')
    ElMessage.success('退出登录成功')
  }
}
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

.create-content {
  padding: 0 24px;
  max-width: 800px;
}

.form-actions {
  text-align: right;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.form-actions .el-button {
  margin-left: 16px;
}

.el-radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.el-radio {
  margin-right: 0;
}
</style>