const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;
    if (!loginId || !password) return res.status(400).json({ error: 'Missing credentials' });
    const u = await User.findOne({ where: { loginId } });
    if (!u) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, u.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    // return minimal user info (no token implemented)
    res.json({ id: u.id, loginId: u.loginId, name: u.name, role: u.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/request-reset  { loginId }
router.post('/request-reset', async (req, res) => {
  try {
    const { loginId } = req.body;
    if (!loginId) return res.status(400).json({ error: 'Missing loginId' });
    const u = await User.findOne({ where: { loginId } });
    if (!u) return res.status(404).json({ error: 'User not found' });
    const token = crypto.randomBytes(20).toString('hex');
    const expiry = Date.now() + 3600 * 1000; // 1 hour
    // store token and expiry as plain fields on user (add columns via sync)
    u.resetToken = token;
    u.resetTokenExpiry = expiry;
    await u.save();
    // In production you'd email the token. Here we return it so frontend can use it.
    res.json({ ok: true, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset  { token, newPassword }
router.post('/reset', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Missing fields' });
    const u = await User.findOne({ where: { resetToken: token } });
    if (!u) return res.status(400).json({ error: 'Invalid token' });
    if (!u.resetTokenExpiry || u.resetTokenExpiry < Date.now()) return res.status(400).json({ error: 'Token expired' });
    u.password = newPassword; // will be hashed by model hook
    u.resetToken = null;
    u.resetTokenExpiry = null;
    await u.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
