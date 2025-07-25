const express = require('express');
const { marked } = require('marked');
const { getConnection } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 所有文档路由都需要认证
router.use(authenticateToken);

// 生成需求文档
router.post('/generate/:projectId/requirement', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const db = getConnection();

    // 获取项目信息和需求
    const [projects] = await db.execute(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      });
    }

    const project = projects[0];
    project.tech_stack = JSON.parse(project.tech_stack || '{}');

    const [requirements] = await db.execute(
      'SELECT * FROM project_requirements WHERE project_id = ? ORDER BY category, field_name',
      [projectId]
    );

    // 生成需求文档内容
    const documentContent = generateRequirementDocument(project, requirements);

    // 保存生成的文档
    const [result] = await db.execute(
      `INSERT INTO generated_documents 
       (project_id, document_type, title, content) 
       VALUES (?, 'requirement', ?, ?)`,
      [projectId, `${project.name} - 需求文档`, documentContent]
    );

    res.json({
      success: true,
      message: '需求文档生成成功',
      data: {
        documentId: result.insertId,
        title: `${project.name} - 需求文档`,
        content: documentContent,
        html: marked(documentContent)
      }
    });

  } catch (error) {
    console.error('生成需求文档错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 生成开发文档
router.post('/generate/:projectId/development', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const db = getConnection();

    // 获取项目信息和需求
    const [projects] = await db.execute(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      });
    }

    const project = projects[0];
    project.tech_stack = JSON.parse(project.tech_stack || '{}');

    const [requirements] = await db.execute(
      'SELECT * FROM project_requirements WHERE project_id = ? ORDER BY category, field_name',
      [projectId]
    );

    // 生成开发文档内容
    const documentContent = generateDevelopmentDocument(project, requirements);

    // 保存生成的文档
    const [result] = await db.execute(
      `INSERT INTO generated_documents 
       (project_id, document_type, title, content) 
       VALUES (?, 'development', ?, ?)`,
      [projectId, `${project.name} - 开发文档`, documentContent]
    );

    res.json({
      success: true,
      message: '开发文档生成成功',
      data: {
        documentId: result.insertId,
        title: `${project.name} - 开发文档`,
        content: documentContent,
        html: marked(documentContent)
      }
    });

  } catch (error) {
    console.error('生成开发文档错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取项目的所有文档
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const db = getConnection();

    // 验证项目所有权
    const [projects] = await db.execute(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      });
    }

    const [documents] = await db.execute(
      `SELECT id, document_type, title, version, is_current, created_at 
       FROM generated_documents 
       WHERE project_id = ? 
       ORDER BY document_type, version DESC`,
      [projectId]
    );

    res.json({
      success: true,
      data: documents
    });

  } catch (error) {
    console.error('获取文档列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取单个文档内容
router.get('/content/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.userId;
    const db = getConnection();

    const [documents] = await db.execute(
      `SELECT d.*, p.user_id 
       FROM generated_documents d 
       JOIN projects p ON d.project_id = p.id 
       WHERE d.id = ? AND p.user_id = ?`,
      [documentId, userId]
    );

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文档不存在'
      });
    }

    const document = documents[0];

    res.json({
      success: true,
      data: {
        ...document,
        html: marked(document.content)
      }
    });

  } catch (error) {
    console.error('获取文档内容错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 生成需求文档的函数
function generateRequirementDocument(project, requirements) {
  const reqByCategory = {};
  requirements.forEach(req => {
    if (!reqByCategory[req.category]) {
      reqByCategory[req.category] = [];
    }
    reqByCategory[req.category].push(req);
  });

  let markdown = `# ${project.name} - 需求文档

## 项目概述

**项目名称**: ${project.name}
**项目类型**: ${project.project_type}
**项目描述**: ${project.description || '暂无描述'}
**创建时间**: ${new Date(project.created_at).toLocaleDateString()}
**最后更新**: ${new Date(project.updated_at).toLocaleDateString()}

## 技术栈

`;

  // 添加技术栈信息
  if (Object.keys(project.tech_stack).length > 0) {
    Object.entries(project.tech_stack).forEach(([key, value]) => {
      markdown += `- **${key}**: ${value}\n`;
    });
  } else {
    markdown += '- 待定\n';
  }

  markdown += '\n## 功能需求\n\n';

  // 按分类添加需求
  Object.entries(reqByCategory).forEach(([category, reqs]) => {
    const categoryNames = {
      'database': '数据库需求',
      'frontend': '前端需求',
      'backend': '后端需求',
      'features': '功能需求',
      'ui': 'UI设计需求',
      'deployment': '部署需求',
      'scale': '项目规模',
      'timeline': '时间规划'
    };

    markdown += `### ${categoryNames[category] || category}\n\n`;

    reqs.forEach(req => {
      if (req.field_value && req.field_value.trim()) {
        markdown += `**${req.field_name}**: ${req.field_value}\n\n`;
      }
    });
  });

  markdown += `## 验收标准

- [ ] 所有核心功能正常运行
- [ ] 界面友好，用户体验良好
- [ ] 代码质量符合团队规范
- [ ] 通过所有测试用例
- [ ] 部署成功，性能达标

## 项目里程碑

1. **需求分析完成** - 确认所有功能需求
2. **设计阶段完成** - UI/UX设计和技术架构设计
3. **开发阶段完成** - 核心功能开发完成
4. **测试阶段完成** - 功能测试和性能测试通过
5. **部署上线** - 项目成功部署并运行

---
*文档生成时间: ${new Date().toLocaleString()}*
`;

  return markdown;
}

// 生成开发文档的函数
function generateDevelopmentDocument(project, requirements) {
  const reqByCategory = {};
  requirements.forEach(req => {
    if (!reqByCategory[req.category]) {
      reqByCategory[req.category] = [];
    }
    reqByCategory[req.category].push(req);
  });

  let markdown = `# ${project.name} - 开发文档

## 项目架构

### 技术栈选择

`;

  // 添加详细的技术栈说明
  if (Object.keys(project.tech_stack).length > 0) {
    Object.entries(project.tech_stack).forEach(([key, value]) => {
      markdown += `- **${key}**: ${value}\n`;
    });
  }

  markdown += `
### 项目结构

\`\`\`
${project.name}/
├── frontend/          # 前端代码
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── router/
│   │   └── store/
├── backend/           # 后端代码
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
├── database/          # 数据库脚本
└── docs/             # 项目文档
\`\`\`

## 环境配置

### 开发环境要求

- Node.js >= 16.0.0
- MySQL >= 8.0
- Vue CLI >= 5.0

### 安装步骤

1. 克隆项目代码
\`\`\`bash
git clone <repository-url>
cd ${project.name}
\`\`\`

2. 安装前端依赖
\`\`\`bash
cd frontend
npm install
\`\`\`

3. 安装后端依赖
\`\`\`bash
cd backend
npm install
\`\`\`

4. 配置数据库
\`\`\`bash
# 创建数据库
mysql -u root -p
CREATE DATABASE ${project.name.toLowerCase().replace(/\s+/g, '_')};
\`\`\`

## 功能模块设计

`;

  // 根据需求生成功能模块
  Object.entries(reqByCategory).forEach(([category, reqs]) => {
    if (category === 'features') {
      markdown += '### 核心功能模块\n\n';
      reqs.forEach(req => {
        if (req.field_value && req.field_value.trim()) {
          markdown += `#### ${req.field_name}\n\n`;
          markdown += `**功能描述**: ${req.field_value}\n\n`;
          markdown += `**实现要点**:\n`;
          markdown += `- 数据模型设计\n`;
          markdown += `- API接口开发\n`;
          markdown += `- 前端界面实现\n`;
          markdown += `- 权限控制\n\n`;
        }
      });
    }
  });

  markdown += `## 数据库设计

### 核心数据表

根据需求分析，需要设计以下数据表：

\`\`\`sql
-- 用户表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 根据具体需求添加其他表...
\`\`\`

## API设计

### RESTful API 规范

- GET /api/resource - 获取资源列表
- GET /api/resource/:id - 获取单个资源
- POST /api/resource - 创建新资源
- PUT /api/resource/:id - 更新资源
- DELETE /api/resource/:id - 删除资源

### 认证方式

使用JWT Token进行身份验证：

\`\`\`
Authorization: Bearer <token>
\`\`\`

## 前端开发规范

### 组件结构

\`\`\`javascript
<template>
  <!-- 模板内容 -->
</template>

<script>
export default {
  name: 'ComponentName',
  // 组件逻辑
}
</script>

<style scoped>
/* 样式定义 */
</style>
\`\`\`

### 状态管理

使用Vuex进行全局状态管理，按功能模块划分store。

## 部署配置

### 生产环境部署

1. 构建前端项目
\`\`\`bash
cd frontend
npm run build
\`\`\`

2. 启动后端服务
\`\`\`bash
cd backend
npm start
\`\`\`

3. 配置Nginx反向代理

### 监控和日志

- 使用PM2管理Node.js进程
- 配置日志收集和监控告警

## 测试策略

### 单元测试

- 使用Jest进行JavaScript单元测试
- 测试覆盖率要求达到80%以上

### 集成测试

- API接口测试
- 数据库集成测试

## 开发流程

1. **功能分析** - 分析需求，设计方案
2. **数据库设计** - 设计数据表结构
3. **API开发** - 实现后端接口
4. **前端开发** - 实现用户界面
5. **联调测试** - 前后端联调
6. **部署上线** - 发布到生产环境

---
*文档生成时间: ${new Date().toLocaleString()}*
`;

  return markdown;
}

module.exports = router;