const express = require('express');
const router = express.Router();
const { Encounter, MedicalRecord, Prescription, PhysicalTherapyRecord, OccupationalTherapyRecord, Medication, PrescriptionMedication, User } = require('../models');

// GET /api/encounters
router.get('/', async (req, res) => {
  const rows = await Encounter.findAll();
  res.json(rows);
});

// POST /api/encounters
router.post('/', async (req, res) => {
  const e = await Encounter.create(req.body);
  res.status(201).json(e);
});

// GET /api/encounters/:id (with related records)
router.get('/:id', async (req, res) => {
  const e = await Encounter.findByPk(req.params.id, {
    include: [
      { model: MedicalRecord, include: [User] },
      { model: Prescription, include: [
          User,
          // include prescription medications and their Medication info so pm.Medication is available
          { model: PrescriptionMedication, include: [Medication] }
        ]
      },
      { model: PhysicalTherapyRecord, include: [User] },
      { model: OccupationalTherapyRecord, include: [User] },
      User
    ],
    order: [
      [MedicalRecord, 'createdAt', 'DESC'],
      [Prescription, 'createdAt', 'DESC'],
      [PhysicalTherapyRecord, 'treatmentDate', 'DESC']
    ]
  });
  if (!e) return res.status(404).json({ error: 'Not found' });
  res.json(e);
});

// PUT /api/encounters/:id
router.put('/:id', async (req, res) => {
  try {
    const e = await Encounter.findByPk(req.params.id);
    if (!e) return res.status(404).json({ error: 'Not found' });
    await e.update(req.body);
    res.json(e);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/encounters/:id
router.delete('/:id', async (req, res) => {
  try {
    const e = await Encounter.findByPk(req.params.id);
    if (!e) return res.status(404).json({ error: 'Not found' });
    await e.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MedicalRecord CRUD (nested under encounters) ---
// POST /api/encounters/:id/medical_records
router.post('/:id/medical_records', async (req, res) => {
  try {
    const encounterId = req.params.id;
    const authorId = req.headers['x-user-id'] || null;
    const payload = Object.assign({}, req.body, { encounterId, userId: authorId });
    const r = await MedicalRecord.create(payload);
    res.status(201).json(r);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/encounters/medical_records/:recordId
router.put('/medical_records/:recordId', async (req, res) => {
  try {
    const r = await MedicalRecord.findByPk(req.params.recordId);
    if (!r) return res.status(404).json({ error: 'Not found' });
    await r.update(req.body);
    res.json(r);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/encounters/medical_records/:recordId
router.delete('/medical_records/:recordId', async (req, res) => {
  try {
    const r = await MedicalRecord.findByPk(req.params.recordId);
    if (!r) return res.status(404).json({ error: 'Not found' });
    await r.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Prescription CRUD ---
// POST /api/encounters/:id/prescriptions
router.post('/:id/prescriptions', async (req, res) => {
  try {
    const encounterId = req.params.id;
    const authorId = req.headers['x-user-id'] || null;
    const payload = Object.assign({}, req.body, { encounterId, doctorId: authorId });
    const p = await Prescription.create(payload);
    res.status(201).json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/encounters/prescriptions/:prescId
router.delete('/prescriptions/:prescId', async (req, res) => {
  try {
    const p = await Prescription.findByPk(req.params.prescId);
    if (!p) return res.status(404).json({ error: 'Not found' });
    await p.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Physical Therapy CRUD ---
// POST /api/encounters/:id/pt_records
router.post('/:id/pt_records', async (req, res) => {
  try {
    const encounterId = req.params.id;
    const authorId = req.headers['x-user-id'] || null;
    const payload = Object.assign({}, req.body, { encounterId, userId: authorId });
    const t = await PhysicalTherapyRecord.create(payload);
    res.status(201).json(t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Occupational Therapy CRUD ---
// POST /api/encounters/:id/ot_records
router.post('/:id/ot_records', async (req, res) => {
  try {
    const encounterId = req.params.id;
    const authorId = req.headers['x-user-id'] || null;
    const payload = Object.assign({}, req.body, { encounterId, userId: authorId });
    const t = await OccupationalTherapyRecord.create(payload);
    res.status(201).json(t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/encounters/ot_records/:otId
router.put('/ot_records/:otId', async (req, res) => {
  try {
    const t = await OccupationalTherapyRecord.findByPk(req.params.otId);
    if (!t) return res.status(404).json({ error: 'Not found' });
    await t.update(req.body);
    res.json(t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/encounters/ot_records/:otId
router.delete('/ot_records/:otId', async (req, res) => {
  try {
    const t = await OccupationalTherapyRecord.findByPk(req.params.otId);
    if (!t) return res.status(404).json({ error: 'Not found' });
    await t.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/encounters/pt_records/:ptId
router.put('/pt_records/:ptId', async (req, res) => {
  try {
    const t = await PhysicalTherapyRecord.findByPk(req.params.ptId);
    if (!t) return res.status(404).json({ error: 'Not found' });
    await t.update(req.body);
    res.json(t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/encounters/pt_records/:ptId
router.delete('/pt_records/:ptId', async (req, res) => {
  try {
    const t = await PhysicalTherapyRecord.findByPk(req.params.ptId);
    if (!t) return res.status(404).json({ error: 'Not found' });
    await t.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
