const express = require('express');
const router = express.Router();
const { Patient, Encounter } = require('../models');

// GET /api/patients
router.get('/', async (req, res) => {
  // if client requests encounters include them (used for sorting by last visit)
  const includeEncounters = req.query.includeEncounters === '1' || req.query.includeEncounters === 'true';
  const opts = includeEncounters ? { include: [Encounter] } : {};
  const patients = await Patient.findAll(opts);
  res.json(patients);
});

// POST /api/patients
router.post('/', async (req, res) => {
  try {
    const p = await Patient.create(req.body);
    res.status(201).json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/patients/:id (include encounters ordered by visitDate desc)
router.get('/:id', async (req, res) => {
  const p = await Patient.findByPk(req.params.id, {
    include: [Encounter],
    order: [[Encounter, 'visitDate', 'DESC']]
  });
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// PUT /api/patients/:id
router.put('/:id', async (req, res) => {
  try {
    const p = await Patient.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    await p.update(req.body);
    res.json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/patients/:id
router.delete('/:id', async (req, res) => {
  try {
    const p = await Patient.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    await p.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
