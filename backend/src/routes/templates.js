const express = require('express');
const { getConnection } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

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
        options: JSON.parse(template.options),
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
      options: JSON.parse(template.options),
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