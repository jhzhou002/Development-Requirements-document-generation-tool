# 部署指南

## 开发环境部署

### 1. 初始化数据库

```bash
# 连接到MySQL服务器
mysql -h 8.153.77.15 -u connect -p

# 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS generation_tool;
USE generation_tool;

# 导入数据库结构
source database.sql;

# 验证表是否创建成功
SHOW TABLES;
```

### 2. 启动后端服务

```bash
cd backend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

服务将在 http://localhost:3000 启动

### 3. 启动前端服务

```bash
cd frontend

# 安装依赖  
npm install

# 启动开发服务器
npm run dev
```

前端将在 http://localhost:8080 启动

## 生产环境部署

### 使用 PM2 部署后端

```bash
# 全局安装 PM2
npm install -g pm2

# 进入后端目录
cd backend

# 安装生产依赖
npm install --production

# 使用 PM2 启动应用
pm2 start src/app.js --name "doc-generator-api"

# 保存 PM2 配置
pm2 save

# 设置开机自启动
pm2 startup
```

### 构建和部署前端

```bash
cd frontend

# 构建生产版本
npm run build

# 将 dist 目录部署到 Web 服务器
# 例如复制到 Nginx 目录
cp -r dist/* /var/www/html/
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 配置 HTTPS（可选）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## Docker 部署（可选）

### Dockerfile - 后端

```dockerfile
# backend/Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY src ./src

EXPOSE 3000

CMD ["npm", "start"]
```

### Dockerfile - 前端

```dockerfile
# frontend/Dockerfile
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mysql
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
      
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: your_root_password
      MYSQL_DATABASE: generation_tool
      MYSQL_USER: connect
      MYSQL_PASSWORD: Zhjh0704.
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  mysql_data:
```

### 使用 Docker Compose 部署

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 监控和维护

### 日志监控

```bash
# 查看 PM2 日志
pm2 logs

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 性能监控

```bash
# PM2 监控
pm2 monit

# 系统资源监控
htop
df -h
```

### 备份数据库

```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="generation_tool"

mysqldump -h 8.153.77.15 -u connect -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### 定期更新

```bash
# 更新后端
cd backend
git pull
npm install --production
pm2 restart doc-generator-api

# 更新前端
cd frontend
git pull
npm install
npm run build
cp -r dist/* /var/www/html/
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库服务是否启动
   - 验证连接配置是否正确
   - 检查防火墙设置

2. **前端构建失败**
   - 清除 node_modules 重新安装
   - 检查 Node.js 版本是否匹配

3. **API 请求失败**
   - 检查后端服务是否运行
   - 验证 API 路径是否正确
   - 查看控制台错误信息

### 日志分析

```bash
# 分析访问日志
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr

# 查找错误请求
grep "40[0-9]" /var/log/nginx/access.log

# 监控 API 响应时间
tail -f /var/log/nginx/access.log | awk '{print $NF}'
```