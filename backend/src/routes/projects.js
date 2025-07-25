const express = require('express');
const Joi = require('joi');
const { getConnection } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 安全的tech_stack解析函数
function parseTechStack(techStack) {
  if (!techStack) {
    return {};
  }
  
  // 如果已经是对象，直接返回
  if (typeof techStack === 'object') {
    return techStack;
  }
  
  // 如果是字符串，尝试解析
  if (typeof techStack === 'string') {
    try {
      return JSON.parse(techStack);
    } catch (error) {
      console.warn('解析tech_stack失败，使用默认值:', error.message);
      return {};
    }
  }
  
  // 其他情况返回空对象
  return {};
}

// 所有项目路由都需要认证
router.use(authenticateToken);

// 创建项目验证规则
const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().allow(''),
  project_type: Joi.string().valid('web', 'mobile', 'desktop', 'api', 'other').default('web'),
  tech_stack: Joi.object().default({})
});

// 创建新项目
router.post('/', async (req, res) => {
  try {
    const { error, value } = createProjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { name, description, project_type, tech_stack } = value;
    const userId = req.user.userId;
    const db = getConnection();

    const [result] = await db.execute(
      'INSERT INTO projects (user_id, name, description, project_type, tech_stack) VALUES (?, ?, ?, ?, ?)',
      [userId, name, description || null, project_type, JSON.stringify(tech_stack)]
    );

    res.status(201).json({
      success: true,
      message: '项目创建成功',
      data: {
        projectId: result.insertId,
        name,
        description,
        project_type,
        tech_stack
      }
    });

  } catch (error) {
    console.error('创建项目错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取用户的所有项目
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getConnection();

    const [projects] = await db.execute(
      `SELECT id, name, description, project_type, tech_stack, status, 
              created_at, updated_at 
       FROM projects 
       WHERE user_id = ? 
       ORDER BY updated_at DESC`,
      [userId]
    );

    const formattedProjects = projects.map(project => ({
      ...project,
      tech_stack: parseTechStack(project.tech_stack)
    }));

    res.json({
      success: true,
      data: formattedProjects
    });

  } catch (error) {
    console.error('获取项目列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取单个项目详情
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const db = getConnection();

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
    project.tech_stack = parseTechStack(project.tech_stack);

    // 获取项目需求
    const [requirements] = await db.execute(
      'SELECT * FROM project_requirements WHERE project_id = ? ORDER BY category, field_name',
      [projectId]
    );

    res.json({
      success: true,
      data: {
        project,
        requirements
      }
    });

  } catch (error) {
    console.error('获取项目详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更新项目需求
router.put('/:projectId/requirements', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { requirements } = req.body;
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

    // 获取连接进行事务处理
    const connection = await db.getConnection();

    try {
      // 开始事务
      await connection.beginTransaction();

      // 删除现有需求
      await connection.execute('DELETE FROM project_requirements WHERE project_id = ?', [projectId]);

      // 插入新需求
      for (const req of requirements) {
        await connection.execute(
          `INSERT INTO project_requirements 
           (project_id, category, field_name, field_value, field_type, is_optimized, original_value) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            projectId,
            req.category,
            req.field_name,
            req.field_value,
            req.field_type,
            req.is_optimized || false,
            req.original_value || null
          ]
        );
      }

      // 更新项目修改时间
      await connection.execute(
        'UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [projectId]
      );

      // 提交事务
      await connection.commit();

      res.json({
        success: true,
        message: '项目需求更新成功'
      });

    } catch (error) {
      // 回滚事务
      await connection.rollback();
      throw error;
    } finally {
      // 释放连接
      connection.release();
    }

  } catch (error) {
    console.error('更新项目需求错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 删除项目
router.delete('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const db = getConnection();

    const [result] = await db.execute(
      'DELETE FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      });
    }

    res.json({
      success: true,
      message: '项目删除成功'
    });

  } catch (error) {
    console.error('删除项目错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

module.exports = router;