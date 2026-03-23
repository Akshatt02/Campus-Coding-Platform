import pool from '../config/db.js';

export const createContest = async (req, res) => {
  try {
    const { title, start_time, end_time } = req.body;
    const facultyId = req.user.id;

    const [[faculty]] = await pool.query(
      'SELECT department_id FROM users WHERE id = ?',
      [facultyId]
    );

    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    const [result] = await pool.query(
      `INSERT INTO contests (title, department_id, start_time, end_time, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [title, faculty.department_id, start_time, end_time, facultyId]
    );

    res.json({ message: 'Contest created successfully', contestId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating contest' });
  }
};

export const createProblemWithTags = async (req, res) => {
  try {
    const { title, statement, difficulty, tags, testcases } = req.body;
    const facultyId = req.user.id;

    const [problemResult] = await pool.query(
      `INSERT INTO problems (title, statement, difficulty, created_by)
       VALUES (?, ?, ?, ?)`,
      [title, statement, difficulty, facultyId]
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

export const addProblemToContest = async (req, res) => {
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

export const getFacultyContests = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const [contests] = await pool.query(
      'SELECT * FROM contests WHERE created_by = ? ORDER BY created_at DESC',
      [facultyId]
    );
    res.json(contests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching faculty contests' });
  }
};

export const removeProblemFromContest = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { contestId, problemId } = req.params;

    // ensure contest belongs to faculty
    const [[contest]] = await pool.query('SELECT * FROM contests WHERE id = ? AND created_by = ?', [contestId, facultyId]);
    if (!contest) return res.status(403).json({ message: 'Not authorized to modify this contest' });

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

export const updateContest = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { contestId } = req.params;
    const { title, start_time, end_time } = req.body;

    const [[contest]] = await pool.query('SELECT * FROM contests WHERE id = ? AND created_by = ?', [contestId, facultyId]);
    if (!contest) return res.status(403).json({ message: 'Not authorized to edit this contest' });

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

export const deleteContest = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { contestId } = req.params;

    const [[contest]] = await pool.query('SELECT * FROM contests WHERE id = ? AND created_by = ?', [contestId, facultyId]);
    if (!contest) return res.status(403).json({ message: 'Not authorized to delete this contest' });

    // delete submissions tied to contest, participants, and contest problems, then contest
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
