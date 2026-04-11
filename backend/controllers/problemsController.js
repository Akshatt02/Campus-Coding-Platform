// src/controllers/problemsController.js
import pool from '../config/db.js';

export const getProblems = async (req, res) => {
    try {
        const { tags, difficulty, page = 1, limit = 20, q } = req.query;
        const offset = (page - 1) * limit;

        let base = `
      SELECT p.*, 
        IFNULL((
          SELECT ROUND(100 * SUM(s.verdict = 'AC') / COUNT(*), 2)
          FROM submissions s WHERE s.problem_id = p.id
        ), 0) AS ac_percent,
        IF(EXISTS(
          SELECT 1 FROM contest_problems cp
          JOIN contests c ON c.id = cp.contest_id
          WHERE cp.problem_id = p.id AND c.end_time > NOW()
        ), 0, 1) AS is_visible_now
      FROM problems p
    `;

        const where = [];
        const params = [];

        if (difficulty) {
            where.push('p.difficulty = ?');
            params.push(difficulty);
        }
        if (q) {
            where.push('(p.title LIKE ? OR p.statement LIKE ?)');
            params.push(`%${q}%`, `%${q}%`);
        }

        if (where.length) base += ' WHERE ' + where.join(' AND ');
        base += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.query(base, params);

        if (tags) {
            const tagList = tags
                .split(',')
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean);
            if (tagList.length) {
                const filtered = [];
                for (const p of rows) {
                    const [ptags] = await pool.query(
                        `SELECT t.name FROM tags t 
             JOIN problem_tags pt ON pt.tag_id = t.id 
             WHERE pt.problem_id = ?`,
                        [p.id]
                    );
                    const names = ptags.map((x) => x.name.toLowerCase());
                    const hasAll = tagList.every((t) => names.includes(t));
                    if (hasAll) filtered.push(p);
                }
                return res.json({ data: filtered });
            }
        }

        const isAdminOrFaculty = req.user && (req.user.role === 'admin' || req.user.role === 'faculty');

        // Filter visibility
        const visible = rows.filter((r) => {
            if (isAdminOrFaculty) return true;
            return (r.visible === 1 || r.visible === true) && r.is_visible_now == 1;
        });

        res.json({ data: visible });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdminOrFaculty = req.user && (req.user.role === 'admin' || req.user.role === 'faculty');

        const [rows] = await pool.query(
            `SELECT p.*, 
                IFNULL((
                    SELECT ROUND(100 * SUM(s.verdict = 'AC') / COUNT(*), 2)
                    FROM submissions s WHERE s.problem_id = p.id
                ), 0) AS ac_percent,
                (SELECT GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ',') 
                    FROM problem_tags pt
                    JOIN tags t ON t.id = pt.tag_id
                    WHERE pt.problem_id = p.id
                ) AS tags,
                IF(EXISTS(
                    SELECT 1 FROM contest_problems cp
                    JOIN contests c ON c.id = cp.contest_id
                    WHERE cp.problem_id = p.id AND c.end_time > NOW()
                ), 0, 1) AS is_visible_now
            FROM problems p
            WHERE p.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        const problem = rows[0];

        // Check visibility if not admin/faculty
        if (!isAdminOrFaculty) {
            if (!(problem.visible === 1 || problem.visible === true) || problem.is_visible_now == 0) {
                return res.status(404).json({ message: 'Problem not found' });
            }
        }

        res.json(problem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTestcases = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            'SELECT input, expected_output AS expected FROM testcases WHERE problem_id = ?',
            [id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
