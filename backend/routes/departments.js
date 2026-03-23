import express from 'express';
import pool from '../config/db.js';
import { authenticateFaculty } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM departments');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/department/:dept', authenticateFaculty, async (req, res) => {
  try {
    const dept = req.params.dept;
    const [rows] = await pool.query(
      `SELECT id, name, email, rating, batch
       FROM users
       WHERE department_id = ? AND role = 'user'`,
      [dept]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching department users' });
  }
});

router.get('/department/:dept/stats', authenticateFaculty, async (req, res) => {
  try {
    const dept = req.params.dept;

    const batchSql = `
      WITH user_solved AS (
        SELECT u.id, u.batch, u.rating,
          (SELECT COUNT(DISTINCT s.problem_id) FROM submissions s WHERE s.user_id = u.id AND s.verdict = 'AC') AS solved_count
        FROM users u
        WHERE u.role = 'user' AND u.department_id = ?
      )
      SELECT
        COALESCE(batch, 'unknown') AS batch,
        MAX(rating) AS highest_rating,
        MAX(solved_count) AS highest_solved,
        AVG(rating) AS avg_rating,
        AVG(solved_count) AS avg_solved,
        COUNT(*) AS users_count
      FROM user_solved
      GROUP BY batch
      ORDER BY batch ASC
    `;

    const [batchStats] = await pool.query(batchSql, [dept]);

    if (req.query.format === 'csv' || req.query.download === '1') {
      const header = 'batch,users_count,highest_rating,highest_solved,avg_rating,avg_solved\n';
      const lines = batchStats.map(b =>
        `${b.batch},${b.users_count},${b.highest_rating || 0},${b.highest_solved || 0},${Number(b.avg_rating || 0).toFixed(2)},${Number(b.avg_solved || 0).toFixed(2)}`
      );
      const csv = header + lines.join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="department_${dept}_batch_stats.csv"`);
      return res.send(csv);
    }

    res.json({ batchStats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching department stats' });
  }
});

export default router;
