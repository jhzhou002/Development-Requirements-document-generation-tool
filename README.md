# 需求文档生成工具

一个帮助用户快速生成清晰、完善的需求文档和开发文档的工具。通过模板化表单和AI优化功能，让想法快速转化为结构化的项目文档。

## 功能特点

- 🎯 **模板化表单** - 通过预设选项降低用户输入门槛
- 🤖 **AI文本优化** - 一键优化用户输入，使描述更清晰专业
- 📝 **自动文档生成** - 生成需求文档和开发文档
- 💾 **项目管理** - 保存和管理多个项目
- 📱 **响应式设计** - 支持PC和移动端访问
- 📄 **Markdown导出** - 支持导出为MD格式文档

## 技术栈

### 前端
- Vue 3 + Composition API
- Element Plus UI框架
- Pinia状态管理
- Vue Router路由
- Axios HTTP客户端
- Vite构建工具

### 后端
- Node.js + Express
- MySQL数据库
- JWT身份认证
- Joi数据验证

## 项目结构

```
需求文档生成工具/
├── frontend/          # 前端Vue项目
│   ├── src/
│   │   ├── components/  # 公共组件
│   │   ├── views/       # 页面组件
│   │   ├── router/      # 路由配置
│   │   ├── store/       # 状态管理
│   │   ├── services/    # API服务
│   │   └── styles/      # 样式文件
├── backend/           # 后端Node.js项目
│   ├── src/
│   │   ├── controllers/ # 控制器
│   │   ├── models/      # 数据模型
│   │   ├── routes/      # 路由定义
│   │   ├── middleware/  # 中间件
│   │   └── config/      # 配置文件
└── database.sql       # 数据库建表脚本
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm 或 yarn

### 1. 数据库设置

首先创建MySQL数据库并导入表结构：

```bash
# 登录MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE generation_tool;

# 导入表结构
mysql -u root -p generation_tool < database.sql
```

### 2. 后端设置

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置以下信息：
# - 数据库连接信息
# - JWT密钥（请更改为随机字符串）
# - AI API配置（可选）

# 启动开发服务器
npm run dev
```

后端服务将运行在 http://localhost:3000

### 3. 前端设置

```bash
# 新开终端，进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将运行在 http://localhost:8080

### 4. 访问应用

打开浏览器访问 http://localhost:8080

1. 注册新用户账号
2. 登录系统
3. 创建新项目
4. 填写项目需求
5. 生成文档

## 核心功能使用

### 创建项目
1. 点击"创建项目"
2. 填写项目基本信息（名称、描述、类型）
3. 选择技术栈

### 配置需求
1. 进入项目详情页
2. 点击"编辑需求"
3. 通过表单选择和输入需求信息
4. 使用"一键优化"改善文本描述

### 生成文档
1. 完成需求配置后
2. 点击"生成需求文档"或"生成开发文档"
3. 查看并导出生成的Markdown文档

## API文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 项目管理
- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目
- `GET /api/projects/:id` - 获取项目详情
- `PUT /api/projects/:id/requirements` - 更新项目需求
- `DELETE /api/projects/:id` - 删除项目

### 文档生成
- `POST /api/documents/generate/:projectId/requirement` - 生成需求文档
- `POST /api/documents/generate/:projectId/development` - 生成开发文档
- `GET /api/documents/:projectId` - 获取项目文档列表

### AI优化
- `POST /api/ai/optimize-text` - 优化文本
- `GET /api/ai/optimization-history/:projectId` - 获取优化历史

## 部署

### 生产环境部署

1. **构建前端**
```bash
cd frontend
npm run build
```

2. **配置环境变量**
```bash
cd backend
# 编辑.env文件，设置生产环境配置
NODE_ENV=production
```

3. **启动后端服务**
```bash
cd backend
npm start
```

4. **配置Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 开发指南

### 前端开发
- 使用Vue 3 Composition API
- 遵循Element Plus设计规范
- 组件命名使用PascalCase
- 使用TypeScript增强类型安全（可选）

### 后端开发
- 使用Express.js构建RESTful API
- 统一错误处理和响应格式
- 参数验证使用Joi
- 数据库操作使用原生SQL

### 代码规范
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- Git提交信息遵循Conventional Commits规范

## 贡献指南

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

如有疑问或建议，请通过以下方式联系：

- 项目Issues: [GitHub Issues](https://github.com/your-username/doc-generator/issues)
- 邮箱: your-email@example.com

## 更新日志

### v1.0.0 (2024-01-XX)
- 初始版本发布
- 基础项目管理功能
- 需求文档和开发文档生成
- AI文本优化功能
- 用户认证系统