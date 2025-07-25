const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '8.153.77.15',
  user: process.env.DB_USER || 'connect',
  password: process.env.DB_PASSWORD || 'Zhjh0704.',
  database: process.env.DB_DATABASE || 'generation_tool',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: '+08:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

let pool;

const createConnection = async () => {
  try {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    console.log('数据库连接池创建成功');
    return pool;
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
};

const getConnection = () => {
  if (!pool) {
    throw new Error('数据库连接池未初始化');
  }
  return pool;
};

module.exports = {
  createConnection,
  getConnection,
  dbConfig
};