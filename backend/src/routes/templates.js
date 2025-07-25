const express = require('express');
const { getConnection } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 安全的JSON解析函数
function safeJsonParse(jsonString, defaultValue = []) {
  if (!jsonString) {
    return defaultValue;
  }
  
  // 如果已经是对象/数组，直接返回
  if (typeof jsonString === 'object') {
    return jsonString;
  }
  
  // 如果是字符串，尝试解析
  if (typeof jsonString === 'string') {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('解析JSON失败，使用默认值:', error.message);
      return defaultValue;
    }
  }
  
  // 其他情况返回默认值
  return defaultValue;
}

// 获取所有需求模板
router.get('/', async (req, res) => {
  try {
    const db = getConnection();
    
    const [templates] = await db.execute(
      'SELECT * FROM requirement_templates WHERE is_active = TRUE ORDER BY category, name'
    );

    // 按分类组织模板数据
    const templatesByCategory = {};
    templates.forEach(template => {
      if (!templatesByCategory[template.category]) {
        templatesByCategory[template.category] = [];
      }
      templatesByCategory[template.category].push({
        id: template.id,
        name: template.name,
        options: safeJsonParse(template.options, []),
        description: template.description
      });
    });

    res.json({
      success: true,
      data: templatesByCategory
    });

  } catch (error) {
    console.error('获取模板错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 根据分类获取模板
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const db = getConnection();
    
    const [templates] = await db.execute(
      'SELECT * FROM requirement_templates WHERE category = ? AND is_active = TRUE ORDER BY name',
      [category]
    );

    const formattedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      options: safeJsonParse(template.options, []),
      description: template.description
    }));

    res.json({
      success: true,
      data: formattedTemplates
    });

  } catch (error) {
    console.error('获取分类模板错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

module.exports = router;