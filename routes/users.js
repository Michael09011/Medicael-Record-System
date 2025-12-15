const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');

// POST /api/users  - signup
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/users', req.body);
    const { loginId, password, name, role, phone, birthDate, address } = req.body;
    if (!loginId || !password || !name) return res.status(400).json({ error: 'Missing fields' });
    // basic server-side validation
    if (phone) {
      const digits = (phone + '').replace(/\D/g, '');
      if (digits.length < 9 || digits.length > 11) return res.status(400).json({ error: '전화번호 형식이 올바르지 않습니다' });
    }
    if (birthDate) {
      const d = new Date(birthDate);
      if (isNaN(d.getTime())) return res.status(400).json({ error: '생년월일 형식이 올바르지 않습니다' });
      // prevent future birthDate
      if (d.getTime() > Date.now()) return res.status(400).json({ error: '생년월일은 미래일 수 없습니다' });
    }
    // hash will be handled by model hook but ensure it's hashed if hook not present
    const exists = await User.findOne({ where: { loginId } });
    if (exists) return res.status(400).json({ error: '이미 존재하는 아이디입니다' });
    // Only allow setting arbitrary role when request comes from an admin (frontend sends x-user-role header)
    const requesterRole = (req.headers['x-user-role'] || '').toUpperCase();
    const finalRole = requesterRole === 'ADMIN' ? (role || 'DOCTOR') : 'DOCTOR';
    const u = await User.create({ loginId, password, name, role: finalRole, phone: phone || null, birthDate: birthDate || null, address: address || null });
    console.log('Created user id=', u.id, 'loginId=', u.loginId);
    // do not return password
    const out = { id: u.id, loginId: u.loginId, name: u.name, role: u.role, phone: u.phone, birthDate: u.birthDate, address: u.address };
    res.status(201).json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: require admin (via x-user-role header). This is minimal and for prototype only.
function requireAdmin(req, res) {
  const r = (req.headers['x-user-role'] || '').toUpperCase();
  if (r !== 'ADMIN') {
    res.status(403).json({ error: '관리자 권한 필요' });
    return false;
  }
  return true;
}

// GET /api/users - list users (admin only)
router.get('/', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { q, role, from, to } = req.query;
    const { Op } = require('sequelize');
    const where = {};
    if (q) {
      where[Op.or] = [
        { loginId: { [Op.like]: `%${q}%` } },
        { name: { [Op.like]: `%${q}%` } }
      ];
    }
    if (role) where.role = role;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }
    const list = await User.findAll({ where, attributes: ['id','loginId','name','role','licenseNo','phone','birthDate','address','createdAt'], order: [['createdAt','DESC']] });
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/users/staff - public staff directory (limited fields)
router.get('/staff', async (req, res) => {
  try {
    const list = await User.findAll({ attributes: ['id','name','role','licenseNo','phone','birthDate'], order: [['role','ASC'], ['name','ASC']] });
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/users/me - get current user (based on prototype header x-user-id)
router.get('/me', async (req, res) => {
  try {
    const uid = req.headers['x-user-id'];
    if (!uid) return res.status(401).json({ error: '로그인 필요' });
    const u = await User.findByPk(uid, { attributes: ['id','loginId','name','role','licenseNo','phone','birthDate','address'] });
    if (!u) return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    res.json(u);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/users/me - update current user's profile (prototype auth via x-user-id header)
router.put('/me', async (req, res) => {
  try {
    const uid = req.headers['x-user-id'];
    if (!uid) return res.status(401).json({ error: '로그인 필요' });
    const u = await User.findByPk(uid);
    if (!u) return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    const { name, phone, birthDate, address, password } = req.body;
    if (name !== undefined) u.name = name;
    if (phone !== undefined) {
      const digits = (phone + '').replace(/\D/g, '');
      if (digits.length < 9 || digits.length > 11) return res.status(400).json({ error: '전화번호 형식이 올바르지 않습니다' });
      u.phone = phone;
    }
    if (birthDate !== undefined) {
      if (birthDate) {
        const d = new Date(birthDate);
        if (isNaN(d.getTime())) return res.status(400).json({ error: '생년월일 형식이 올바르지 않습니다' });
        if (d.getTime() > Date.now()) return res.status(400).json({ error: '생년월일은 미래일 수 없습니다' });
        u.birthDate = birthDate;
      } else {
        u.birthDate = null;
      }
    }
    if (address !== undefined) u.address = address;
    if (password) u.password = password; // model hook will hash
    await u.save();
    res.json({ id: u.id, loginId: u.loginId, name: u.name, role: u.role, licenseNo: u.licenseNo, phone: u.phone, birthDate: u.birthDate, address: u.address });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/users/:id - get user (admin only)
router.get('/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const u = await User.findByPk(req.params.id, { attributes: ['id','loginId','name','role','licenseNo','createdAt'] });
    if (!u) return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    res.json(u);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/users/:id - update user (admin only)
router.put('/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const u = await User.findByPk(req.params.id);
    if (!u) return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    const { name, role, licenseNo, password, phone, birthDate, address } = req.body;
    if (name !== undefined) u.name = name;
    if (role !== undefined) u.role = role;
    if (licenseNo !== undefined) u.licenseNo = licenseNo;
    // basic validation
    if (phone !== undefined) {
      const digits = (phone + '').replace(/\D/g, '');
      if (digits.length < 9 || digits.length > 11) return res.status(400).json({ error: '전화번호 형식이 올바르지 않습니다' });
      u.phone = phone;
    }
    if (birthDate !== undefined) {
      if (birthDate) {
        const d = new Date(birthDate);
        if (isNaN(d.getTime())) return res.status(400).json({ error: '생년월일 형식이 올바르지 않습니다' });
        // prevent future birthDate
        if (d.getTime() > Date.now()) return res.status(400).json({ error: '생년월일은 미래일 수 없습니다' });
        u.birthDate = birthDate;
      } else {
        u.birthDate = null;
      }
    }
    if (address !== undefined) u.address = address;
    if (password) u.password = password; // model hook will hash
    await u.save();
    res.json({ id: u.id, loginId: u.loginId, name: u.name, role: u.role, licenseNo: u.licenseNo, phone: u.phone, birthDate: u.birthDate, address: u.address });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/users/:id - delete user (admin only)
router.delete('/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const u = await User.findByPk(req.params.id);
    if (!u) return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    await u.destroy();
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/users/:id/reset-password - admin only: generate temporary password and return it (dev only)
router.post('/:id/reset-password', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const u = await User.findByPk(req.params.id);
    if (!u) return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    const crypto = require('crypto');
    const temp = crypto.randomBytes(4).toString('hex');
    // set plaintext; model hook will hash on save
    u.password = temp;
    await u.save();
    // Return temp password so admin can give it to user (DEV ONLY)
    res.json({ ok: true, tempPassword: temp });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
