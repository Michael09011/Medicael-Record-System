const express = require('express');
const router = express.Router();
const { PrescriptionMedication, Medication, Prescription } = require('../models');

// POST /api/prescriptions/:id/medications
router.post('/:id/medications', async (req, res) => {
  try {
    const prescriptionId = req.params.id;
    const payload = Object.assign({}, req.body, { prescriptionId });
    console.log('POST /api/prescriptions/' + prescriptionId + '/medications payload=', payload);
    const pm = await PrescriptionMedication.create(payload);
    // optionally include medication info
    const result = await PrescriptionMedication.findByPk(pm.id, { include: [Medication] });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/prescriptions/medications/:id
router.put('/medications/:id', async (req, res) => {
  try {
    const pm = await PrescriptionMedication.findByPk(req.params.id);
    if (!pm) return res.status(404).json({ error: 'Not found' });
    await pm.update(req.body);
    const result = await PrescriptionMedication.findByPk(pm.id, { include: [Medication] });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/prescriptions/medications/:id
router.delete('/medications/:id', async (req, res) => {
  try {
    const pm = await PrescriptionMedication.findByPk(req.params.id);
    if (!pm) return res.status(404).json({ error: 'Not found' });
    await pm.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
