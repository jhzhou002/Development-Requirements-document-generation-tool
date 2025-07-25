const express = require('express');
const Joi = require('joi');
const { getConnection } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 所有AI路由都需要认证
router.use(authenticateToken);

// 文本优化验证规则
const optimizeTextSchema = Joi.object({
  text: Joi.string().min(1).max(5000).required(),
  optimization_type: Joi.string().valid(
    'requirement', 
    'feature_description', 
    'technical_spec',
    'user_story'
  ).required(),
  project_id: Joi.number().integer().positive().required()
});

// 优化文本接口
router.post('/optimize-text', async (req, res) => {
  try {
    const { error, value } = optimizeTextSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { text, optimization_type, project_id } = value;
    const userId = req.user.userId;
    const db = getConnection();

    // 验证项目所有权
    const [projects] = await db.execute(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [project_id, userId]
    );

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      });
    }

    // 这里是AI优化的核心逻辑
    // 实际项目中可以集成OpenAI、通义千问等AI服务
    const optimizedText = await optimizeTextWithAI(text, optimization_type);

    // 保存优化记录
    await db.execute(
      `INSERT INTO ai_optimizations 
       (project_id, original_text, optimized_text, optimization_type, model_used) 
       VALUES (?, ?, ?, ?, ?)`,
      [project_id, text, optimizedText, optimization_type, 'internal']
    );

    res.json({
      success: true,
      data: {
        original_text: text,
        optimized_text: optimizedText,
        optimization_type
      }
    });

  } catch (error) {
    console.error('文本优化错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取优化历史
router.get('/optimization-history/:projectId', async (req, res) => {
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

    const [optimizations] = await db.execute(
      `SELECT id, original_text, optimized_text, optimization_type, 
              model_used, created_at 
       FROM ai_optimizations 
       WHERE project_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [projectId]
    );

    res.json({
      success: true,
      data: optimizations
    });

  } catch (error) {
    console.error('获取优化历史错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// AI文本优化函数（示例实现）
async function optimizeTextWithAI(text, optimizationType) {
  // 这是一个简化的示例实现
  // 实际项目中应该调用真实的AI API
  
  const optimizationPrompts = {
    requirement: '请将以下需求描述优化得更加清晰、具体和可执行：',
    feature_description: '请将以下功能描述优化得更加详细和专业：',  
    technical_spec: '请将以下技术规格说明优化得更加准确和完整：',
    user_story: '请将以下用户故事优化得更加符合敏捷开发标准：'
  };

  // 简单的文本处理示例（实际应该调用AI API）
  const prompt = optimizationPrompts[optimizationType] || '请优化以下文本：';
  
  // 模拟AI优化（实际项目中替换为真实AI调用）
  let optimizedText = text;
  
  // 基础的文本优化规则
  optimizedText = optimizedText.trim();
  optimizedText = optimizedText.replace(/。+/g, '。');
  optimizedText = optimizedText.replace(/，+/g, '，');
  
  // 根据优化类型添加结构化改进
  switch (optimizationType) {
    case 'requirement':
      if (!optimizedText.includes('功能要求') && !optimizedText.includes('需求')) {
        optimizedText = `**功能需求**：${optimizedText}`;
      }
      break;
    case 'feature_description':
      if (!optimizedText.includes('功能描述')) {
        optimizedText = `**功能描述**：${optimizedText}\n\n**预期效果**：提升用户体验和系统效率。`;
      }
      break;
    case 'technical_spec':
      if (!optimizedText.includes('技术实现')) {
        optimizedText = `**技术实现方案**：${optimizedText}`;
      }
      break;
    case 'user_story':
      if (!optimizedText.startsWith('作为')) {
        optimizedText = `作为用户，我希望${optimizedText}，以便更好地完成相关任务。`;
      }
      break;
  }
  
  return optimizedText;
}

module.exports = router;