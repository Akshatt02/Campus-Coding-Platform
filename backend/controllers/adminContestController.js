import pool from '../config/db.js';

/** Create a new college-wide contest (department_id = NULL) by admin */
export const createAdminContest = async (req, res) => {
  try {
    const { title, start_time, end_time } = req.body;
    const adminId = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO contests (title, department_id, start_time, end_time, created_by)
       VALUES (?, NULL, ?, ?, ?)`,
      [title, start_time, end_time, adminId]
    );

    res.json({ message: 'Contest created successfully', contestId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating contest' });
  }
};

/** Add existing problem to a contest (admin) */
export const addProblemToContestAdmin = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { problemId } = req.body;

    await pool.query(
      `INSERT INTO contest_problems (contest_id, problem_id) VALUES (?, ?)`,
      [contestId, problemId]
    );

    res.json({ message: 'Problem added to contest' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding problem to contest' });
  }
};

/** Create a new problem with tags (admin) */
export const createProblemWithTagsAdmin = async (req, res) => {
  try {
    const { title, statement, difficulty, tags, testcases } = req.body;
    const adminId = req.user.id;

    const [problemResult] = await pool.query(
      `INSERT INTO problems (title, statement, difficulty, created_by)
       VALUES (?, ?, ?, ?)`,
      [title, statement, difficulty, adminId]
    );

    const problemId = problemResult.insertId;

    if (Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        let [tag] = await pool.query('SELECT id FROM tags WHERE name = ?', [tagName]);
        let tagId;
        if (tag.length) tagId = tag[0].id;
        else {
          const [newTag] = await pool.query('INSERT INTO tags (name) VALUES (?)', [tagName]);
          tagId = newTag.insertId;
        }

        await pool.query('INSERT INTO problem_tags (problem_id, tag_id) VALUES (?, ?)', [problemId, tagId]);
      }
    }

    if (Array.isArray(testcases) && testcases.length > 0) {
      for (const testcase of testcases) {
        await pool.query(
          `INSERT INTO testcases (problem_id, input, expected_output) VALUES (?, ?, ?)`,
          [problemId, testcase.input, testcase.expected]
        );
      }
    }

    res.json({ message: 'Problem created successfully', problemId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating problem' });
  }
};

/** Get all contests (admin) */
export const getAdminContests = async (req, res) => {
  try {
    const [contests] = await pool.query('SELECT * FROM contests ORDER BY created_at DESC');
    res.json(contests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching contests' });
  }
};

/** Remove a problem from a contest (admin - no ownership check) */
export const removeProblemFromContestAdmin = async (req, res) => {
  try {
    const { contestId, problemId } = req.params;
    await pool.query('DELETE FROM contest_problems WHERE contest_id = ? AND problem_id = ?', [contestId, problemId]);

    // if no problems left in contest, delete contest and associated data (submissions, participants)
    const [remaining] = await pool.query('SELECT COUNT(*) AS cnt FROM contest_problems WHERE contest_id = ?', [contestId]);
    if (remaining[0].cnt === 0) {
      await pool.query('DELETE FROM submissions WHERE contest_id = ?', [contestId]);
      await pool.query('DELETE FROM contest_participants WHERE contest_id = ?', [contestId]);
      await pool.query('DELETE FROM contests WHERE id = ?', [contestId]);
      return res.json({ message: 'Problem removed; contest had no problems so contest and related data were deleted' });
    }

    res.json({ message: 'Problem removed from contest' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error removing problem from contest' });
  }
};

/** Update contest details (admin - no ownership check) */
export const updateContestAdmin = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { title, start_time, end_time } = req.body;

    if (start_time && end_time && new Date(end_time) <= new Date(start_time)) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const updates = [];
    const params = [];
    if (title) { updates.push('title = ?'); params.push(title); }
    if (start_time) { updates.push('start_time = ?'); params.push(start_time); }
    if (end_time) { updates.push('end_time = ?'); params.push(end_time); }
    if (updates.length === 0) return res.status(400).json({ message: 'No updates provided' });

    params.push(contestId);
    const sql = `UPDATE contests SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(sql, params);

    res.json({ message: 'Contest updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating contest' });
  }
};

/** Delete a contest (admin - no ownership check) */
export const deleteContestAdmin = async (req, res) => {
  try {
    const { contestId } = req.params;
    // delete submissions tied to contest, participants, contest_problems, then contest
    await pool.query('DELETE FROM submissions WHERE contest_id = ?', [contestId]);
    await pool.query('DELETE FROM contest_problems WHERE contest_id = ?', [contestId]);
    await pool.query('DELETE FROM contest_participants WHERE contest_id = ?', [contestId]);
    await pool.query('DELETE FROM contests WHERE id = ?', [contestId]);
    res.json({ message: 'Contest deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting contest' });
  }
};
