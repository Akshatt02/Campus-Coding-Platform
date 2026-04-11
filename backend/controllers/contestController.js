// src/controllers/contestController.js
import pool from '../config/db.js';

/* GET /api/contests */
export const getContests = async (req, res) => {
  try {
    const { role, department_id } = req.user;

    let query = `
      SELECT c.*, d.name AS department_name
      FROM contests c
      LEFT JOIN departments d ON c.department_id = d.id
    `;
    let params = [];

    if (role !== 'admin') {
      query += `
        WHERE c.department_id IS NULL OR c.department_id = ?
        ORDER BY c.start_time DESC
      `;
      params = [department_id];
    } else {
      query += `
        ORDER BY c.start_time DESC
      `;
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch contests' });
  }
};

/* GET /api/contests/:id */
export const getContestById = async (req, res) => {
  try {
    const contestId = req.params.id;
    const userRole = req.user.role;
    const userDept = req.user.department_id;

    const [[contest]] = await pool.query(
      'SELECT c.*, d.name AS department_name FROM contests c LEFT JOIN departments d ON c.department_id = d.id WHERE c.id = ?',
      [contestId]
    );
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    if (contest.department_id && userRole === 'user' && userDept !== contest.department_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const [problems] = await pool.query(
      `SELECT p.*, cp.id as contest_problem_id
       FROM contest_problems cp
       JOIN problems p ON cp.problem_id = p.id
       WHERE cp.contest_id = ?
       ORDER BY cp.id ASC`,
      [contestId]
    );

    res.json({ contest, problems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch contest' });
  }
};

/* ✅ FIXED: GET /api/contests/:id/submissions
   Filters: user_id, user_name (partial), verdict, problem_title
   Only includes submissions within contest window
*/
export const getContestSubmissions = async (req, res) => {
  try {
    const contestId = req.params.id;
    const { user_id, user_name, verdict, problem_id, problem_title, limit = 500, offset = 0 } = req.query;

    const [[contest]] = await pool.query('SELECT * FROM contests WHERE id = ?', [contestId]);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    let sql = `
      SELECT 
        s.id AS submission_id,
        u.id AS user_id,
        u.name AS user_name,
        s.problem_id,
        p.title AS problem_title,
        s.verdict,
        s.created_at
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN problems p ON s.problem_id = p.id
      WHERE s.contest_id = ? 
        AND s.created_at BETWEEN ? AND ?
    `;
    const params = [contestId, contest.start_time, contest.end_time];

    if (user_id) {
      sql += ' AND s.user_id = ?';
      params.push(user_id);
    }
    if (user_name) {
      sql += ' AND u.name LIKE ?';
      params.push(`%${user_name}%`);
    }
    if (verdict) {
      sql += ' AND s.verdict = ?';
      params.push(verdict);
    }
    if (problem_id) {
      sql += ' AND s.problem_id = ?';
      params.push(problem_id);
    }
    if (problem_title) {
      sql += ' AND p.title LIKE ?';
      params.push(`%${problem_title}%`);
    }

    sql += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(sql, params);

    res.json({ submissions: rows, contest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch contest submissions' });
  }
};

/* Leaderboard */
export const getContestLeaderboard = async (req, res) => {
  try {
    const contestId = req.params.id;
    const [[contest]] = await pool.query('SELECT * FROM contests WHERE id = ?', [contestId]);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    const sql = `
      WITH
        s_in AS (
          SELECT s.*
          FROM submissions s
          WHERE s.contest_id = ? 
            AND s.created_at BETWEEN ? AND ?
        ),
        first_ac AS (
          SELECT user_id, problem_id, MIN(created_at) AS first_ac_time
          FROM s_in
          WHERE verdict = 'AC'
          GROUP BY user_id, problem_id
        ),
        wrong_before AS (
          SELECT si.user_id, si.problem_id, COUNT(*) AS wrong_cnt
          FROM s_in si
          LEFT JOIN first_ac fa
            ON si.user_id = fa.user_id AND si.problem_id = fa.problem_id
          WHERE si.verdict <> 'AC'
            AND (fa.first_ac_time IS NULL OR si.created_at < fa.first_ac_time)
          GROUP BY si.user_id, si.problem_id
        ),
        per_problem AS (
          SELECT
            fa.user_id,
            fa.problem_id,
            TIMESTAMPDIFF(MINUTE, (SELECT start_time FROM contests WHERE id = ?), fa.first_ac_time) AS minutes_to_ac,
            COALESCE(wb.wrong_cnt, 0) AS wrong_before
          FROM first_ac fa
          LEFT JOIN wrong_before wb ON fa.user_id = wb.user_id AND fa.problem_id = wb.problem_id
        ),
        per_user AS (
          SELECT
            u.id AS user_id,
            u.name AS user_name,
            COUNT(DISTINCT pp.problem_id) AS solved_count,
            COALESCE(SUM(pp.minutes_to_ac), 0) AS time_sum_minutes,
            COALESCE(SUM(pp.wrong_before), 0) AS wrong_before_total
          FROM users u
          LEFT JOIN per_problem pp ON u.id = pp.user_id
          JOIN contest_participants cp ON cp.user_id = u.id AND cp.contest_id = ?
          GROUP BY u.id
        )
      SELECT
        pu.user_id,
        pu.user_name,
        pu.solved_count,
        pu.time_sum_minutes,
        pu.wrong_before_total,
        (pu.time_sum_minutes + pu.wrong_before_total * 20) AS penalty
      FROM per_user pu
      ORDER BY pu.solved_count DESC, penalty ASC, pu.user_name ASC
      LIMIT 500;
    `;

    const params = [contestId, contest.start_time, contest.end_time, contestId, contestId];
    const [rows] = await pool.query(sql, params);

    let rank = 0;
    let lastKey = null;
    const leaderboard = rows.map((r, i) => {
      const key = `${r.solved_count}_${r.penalty}`;
      if (key !== lastKey) {
        rank = i + 1;
        lastKey = key;
      }
      return { rank, ...r };
    });

    res.json({ leaderboard, contest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to compute leaderboard' });
  }
};

/* Contest Problems (unchanged except better structure) */
export const getContestProblems = async (req, res) => {
  try {
    const contestId = req.params.id;
    const { role, department_id: userDept } = req.user;

    let contestQuery, contestParams;

    if (role === 'admin') {
      contestQuery = `SELECT * FROM contests WHERE id = ?`;
      contestParams = [contestId];
    } else {
      contestQuery = `SELECT * FROM contests WHERE id = ? AND (department_id IS NULL OR department_id = ?)`;
      contestParams = [contestId, userDept];
    }

    const [contestRows] = await pool.query(contestQuery, contestParams);

    if (contestRows.length === 0)
      return res.status(404).json({ message: 'Contest not found or not accessible' });

    const contest = contestRows[0];
    const now = new Date();

    if (role !== 'admin' && role !== 'faculty' && now < new Date(contest.start_time)) {
      return res.status(403).json({ message: 'Contest has not started yet' });
    }

    const [problems] = await pool.query(
      `SELECT
         p.id,
         p.title,
         p.statement,
         p.difficulty,
         p.visible,
         p.created_by,
         p.created_at,
         IFNULL((
           SELECT ROUND(100 * SUM(s.verdict = 'AC') / COUNT(*), 2)
           FROM submissions s WHERE s.problem_id = p.id
         ), 0) AS ac_percent,
         (SELECT GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ',') 
            FROM problem_tags pt
            JOIN tags t ON t.id = pt.tag_id
            WHERE pt.problem_id = p.id
         ) AS tags,
         cp.id AS contest_problem_id
       FROM contest_problems cp
       JOIN problems p ON cp.problem_id = p.id
       WHERE cp.contest_id = ?
       ORDER BY cp.id ASC`,
      [contestId]
    );

    res.json({ contest, problems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch contest problems' });
  }
};

// add to src/controllers/contestController.js

// GET /api/contests/:id/participants
export const getContestParticipants = async (req, res) => {
  try {
    const contestId = req.params.id;

    const [contestRows] = await pool.query('SELECT * FROM contests WHERE id = ?', [contestId]);
    if (!contestRows.length) return res.status(404).json({ message: 'Contest not found' });

    const [rows] = await pool.query(
      `SELECT cp.user_id, u.name AS user_name, cp.rating_before, cp.rating_after, cp.id AS cp_id
       FROM contest_participants cp
       JOIN users u ON u.id = cp.user_id
       WHERE cp.contest_id = ?
       ORDER BY cp.id ASC`,
      [contestId]
    );

    // also indicate whether current user is registered
    const [me] = await pool.query(
      `SELECT 1 FROM contest_participants WHERE contest_id = ? AND user_id = ? LIMIT 1`,
      [contestId, req.user.id]
    );
    const registered = me.length > 0;

    res.json({ participants: rows, registered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch participants' });
  }
};

// PUT /api/contests/:id/participants/:userId/rating
export const updateParticipantRating = async (req, res) => {
  try {
    const contestId = req.params.id;
    const userId = req.params.userId;
    const { rating_after } = req.body;

    if (typeof rating_after === 'undefined') {
      return res.status(400).json({ message: 'rating_after is required' });
    }

    const [[contest]] = await pool.query('SELECT * FROM contests WHERE id = ?', [contestId]);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    // Only admin or the contest creator can update ratings
    if (req.user.role !== 'admin' && req.user.id !== contest.created_by) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Ensure participant exists
    const [cpRows] = await pool.query(
      'SELECT * FROM contest_participants WHERE contest_id = ? AND user_id = ?',
      [contestId, userId]
    );
    if (!cpRows.length) return res.status(404).json({ message: 'Participant not found' });

    // Do not allow changing rating_after once it's set
    if (cpRows[0].rating_after !== null && typeof cpRows[0].rating_after !== 'undefined') {
      return res.status(400).json({ message: 'Rating already set and cannot be changed' });
    }

    // Update contest_participants.rating_after
    await pool.query(
      'UPDATE contest_participants SET rating_after = ? WHERE contest_id = ? AND user_id = ?',
      [rating_after, contestId, userId]
    );

    // Optionally update users.rating to reflect new rating
    await pool.query('UPDATE users SET rating = ? WHERE id = ?', [rating_after, userId]);

    const [[updatedCp]] = await pool.query(
      `SELECT cp.user_id, u.name AS user_name, cp.rating_before, cp.rating_after
       FROM contest_participants cp JOIN users u ON u.id = cp.user_id
       WHERE cp.contest_id = ? AND cp.user_id = ?`,
      [contestId, userId]
    );

    res.json({ participant: updatedCp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update participant rating' });
  }
};

// GET /api/contests/:id/summary
export const getContestSummary = async (req, res) => {
  try {
    const contestId = req.params.id;
    const [[contest]] = await pool.query('SELECT * FROM contests WHERE id = ?', [contestId]);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    const endTime = contest.end_time || new Date();
    const [[pc]] = await pool.query(
      'SELECT COUNT(*) AS participants_count FROM contest_participants WHERE contest_id = ?',
      [contestId]
    );
    const participantsCount = pc.participants_count || 0;

    const [[sc]] = await pool.query(
      `SELECT COUNT(DISTINCT user_id) AS solvers_count
       FROM submissions
       WHERE contest_id = ? AND verdict = 'AC' AND created_at BETWEEN ? AND ?`,
      [contestId, contest.start_time, endTime]
    );
    const solversCount = sc.solvers_count || 0;

    const sql = `
      WITH s_in AS (
        SELECT * FROM submissions
        WHERE contest_id = ? AND created_at BETWEEN ? AND ?
      ),
      first_ac AS (
        SELECT user_id, problem_id, MIN(created_at) AS first_ac_time
        FROM s_in
        WHERE verdict = 'AC'
        GROUP BY user_id, problem_id
      ),
      submissions_to_ac AS (
        SELECT fa.user_id, fa.problem_id, COUNT(si.id) AS submissions_to_ac
        FROM s_in si
        JOIN first_ac fa ON si.user_id = fa.user_id AND si.problem_id = fa.problem_id AND si.created_at <= fa.first_ac_time
        GROUP BY fa.user_id, fa.problem_id
      )
      SELECT
        p.id AS problem_id,
        p.title AS problem_title,
        (SELECT COUNT(*) FROM s_in si WHERE si.problem_id = p.id) AS submissions,
        (SELECT COUNT(*) FROM s_in si WHERE si.problem_id = p.id AND si.verdict = 'AC') AS ac_count,
        (SELECT COUNT(DISTINCT user_id) FROM first_ac fa WHERE fa.problem_id = p.id) AS unique_solvers,
        (SELECT AVG(submissions_to_ac) FROM submissions_to_ac st WHERE st.problem_id = p.id) AS avg_submissions_to_ac
      FROM contest_problems cp
      JOIN problems p ON cp.problem_id = p.id
      WHERE cp.contest_id = ?
      ORDER BY p.id ASC
    `;

    const [rows] = await pool.query(sql, [contestId, contest.start_time, endTime, contestId]);

    const summary = rows.map((r) => {
      const submissions = Number(r.submissions) || 0;
      const ac_count = Number(r.ac_count) || 0;
      const unique_solvers = Number(r.unique_solvers) || 0;
      const avg_submissions_to_ac = r.avg_submissions_to_ac ? Number(r.avg_submissions_to_ac) : null;
      const success_rate = participantsCount > 0 ? unique_solvers / participantsCount : 0;
      return { ...r, submissions, ac_count, unique_solvers, avg_submissions_to_ac, success_rate };
    });

    let hardestProblem = null;
    let easiestProblem = null;
    if (summary.length > 0) {
      const byRate = [...summary].sort((a, b) => a.success_rate - b.success_rate);
      hardestProblem = byRate[0];
      easiestProblem = byRate[byRate.length - 1];
    }

    const percent_solvers = participantsCount > 0 ? (solversCount / participantsCount) * 100 : 0;

    res.json({
      summary,
      participantsCount,
      solversCount,
      percent_solvers,
      hardestProblem,
      easiestProblem,
      contest
    });
  } catch (err) {
    console.error('getContestSummary error:', err);
    res.status(500).json({ message: 'Failed to fetch contest summary' });
  }
};

// POST /api/contests/:id/register
export const registerForContest = async (req, res) => {
  try {
    const contestId = req.params.id;
    const userId = req.user.id;

    const [[contest]] = await pool.query('SELECT * FROM contests WHERE id = ?', [contestId]);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    // allow registration before start or during contest (change logic to block after end_time if desired)
    const now = new Date();
    const start = new Date(contest.start_time);
    const end = new Date(contest.end_time);

    if (now > end) return res.status(403).json({ message: 'Contest already finished' });

    // insert participant if not exists; set rating_before as current user rating
    await pool.query(
      `INSERT IGNORE INTO contest_participants (contest_id, user_id, rating_before)
       VALUES (?, ?, (SELECT rating FROM users WHERE id = ?))`,
      [contestId, userId, userId]
    );

    // return successful registration and current participant list (optional)
    const [rows] = await pool.query(
      `SELECT cp.user_id, u.name AS user_name, cp.rating_before, cp.rating_after
       FROM contest_participants cp JOIN users u ON u.id = cp.user_id
       WHERE cp.contest_id = ?
       ORDER BY cp.id ASC`,
      [contestId]
    );

    res.json({ registered: true, participants: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to register for contest' });
  }
};
