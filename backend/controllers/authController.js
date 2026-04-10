import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res) => {
    try {
        const { name, email, password, role = 'user', department_id = null, batch = null } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: 'Missing fields' });

        if (role !== 'user' && role !== 'faculty' && role !== 'admin')
            return res.status(400).json({ message: 'Invalid role' });

        const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (exists.length)
            return res.status(400).json({ message: 'Email already registered' });
        const rating = role === 'user' ? 1000 : null;
        const [result] = await pool.query(
            `INSERT INTO users (name, email, password, role, department_id, batch, rating)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, email, password, role, department_id, batch, rating]
        );

        const userId = result.insertId;

        let department_name = null;
        if (department_id) {
            const [dept] = await pool.query('SELECT name FROM departments WHERE id = ?', [department_id]);
            department_name = dept[0]?.name || null;
        }

        const token = jwt.sign(
            { id: userId, role, email, department_id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: userId,
                name,
                email,
                role,
                department_id,
                department_name,
                batch,
                rating,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: 'Missing fields' });

        const [rows] = await pool.query('SELECT u.*, d.name as department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id WHERE u.email = ?', [email]);
        if (!rows.length)
            return res.status(400).json({ message: 'Invalid credentials' });

        const user = rows[0];
        if (user.password !== password)
            return res.status(400).json({ message: 'Invalid credentials' });

        if (role && user.role !== role)
            return res.status(403).json({ message: 'Unauthorized role access' });

        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email, department_id: user.department_id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department_id: user.department_id,
                department_name: user.department_name,
                rating: user.rating,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
