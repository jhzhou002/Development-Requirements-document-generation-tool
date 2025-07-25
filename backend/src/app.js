// 首先加载环境变量
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createConnection } = require('./config/database');

// 路由导入
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const templateRoutes = require('./routes/templates');
const documentRoutes = require('./routes/documents');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 路由设置
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: '需求文档生成工具API'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('全局错误处理:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库连接
    await createConnection();
    
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`健康检查: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;