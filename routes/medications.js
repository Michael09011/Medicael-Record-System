const express = require('express');
const router = express.Router();
const { Medication } = require('../models');

// GET /api/medications?q=term
router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) {
    const rows = await Medication.findAll({ limit: 50 });
    return res.json(rows);
  }
  const rows = await Medication.findAll({ where: { name: { [require('sequelize').Op.like]: `%${q}%` } }, limit: 50 });
  res.json(rows);
});

// POST /api/medications  (admin)
router.post('/', async (req, res) => {
  try {
    const m = await Medication.create(req.body);
    res.status(201).json(m);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
