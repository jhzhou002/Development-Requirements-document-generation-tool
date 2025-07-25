-- 需求文档生成工具数据库表结构

-- 用户表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 项目表
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  project_type ENUM('web', 'mobile', 'desktop', 'api', 'other') DEFAULT 'web',
  tech_stack JSON, -- 存储技术栈选择
  status ENUM('draft', 'completed', 'archived') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 需求模板表 - 预设的表单选项配置
CREATE TABLE requirement_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category VARCHAR(50) NOT NULL, -- 'database', 'frontend', 'backend', 'features'
  name VARCHAR(100) NOT NULL,
  options JSON NOT NULL, -- 存储选项数据
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 项目需求表 - 用户填写的具体需求
CREATE TABLE project_requirements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  field_value TEXT,
  field_type ENUM('select', 'multi_select', 'text', 'textarea') NOT NULL,
  is_optimized BOOLEAN DEFAULT FALSE, -- 是否经过AI优化
  original_value TEXT, -- 优化前的原始值
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 生成的文档表
CREATE TABLE generated_documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  document_type ENUM('requirement', 'development', 'api') NOT NULL,
  title VARCHAR(200) NOT NULL,
  content LONGTEXT NOT NULL,
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- AI优化记录表
CREATE TABLE ai_optimizations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  original_text TEXT NOT NULL,
  optimized_text TEXT NOT NULL,
  optimization_type VARCHAR(50) NOT NULL, -- 'requirement', 'feature_description', etc.
  model_used VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 插入基础的需求模板数据
INSERT INTO requirement_templates (category, name, options, description) VALUES 
('database', '数据库类型', '["MySQL", "PostgreSQL", "MongoDB", "SQLite", "Redis", "其他"]', '选择项目使用的数据库类型'),
('frontend', '前端框架', '["Vue.js", "React", "Angular", "原生JavaScript", "jQuery", "其他"]', '选择前端开发框架'),
('backend', '后端技术', '["Node.js", "Python", "Java", "PHP", "Go", "C#", "其他"]', '选择后端开发技术'),
('deployment', '部署方式', '["云服务器", "容器化部署", "传统服务器", "Serverless", "其他"]', '选择项目部署方式'),
('features', '核心功能', '["用户管理", "权限控制", "数据分析", "文件上传", "支付功能", "消息通知", "搜索功能", "缓存优化", "其他"]', '选择项目核心功能模块'),
('ui', 'UI风格', '["现代简约", "商务专业", "活泼可爱", "科技感", "传统经典", "其他"]', '选择界面设计风格'),
('scale', '项目规模', '["小型项目(1-3人)", "中型项目(4-10人)", "大型项目(10+人)"]', '预估项目开发规模'),
('timeline', '开发周期', '["1-2周", "3-4周", "1-2个月", "3-6个月", "6个月以上"]', '预估项目开发时间');