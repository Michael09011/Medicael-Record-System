const express = require('express');
const router = express.Router();

router.use('/patients', require('./patients'));
router.use('/encounters', require('./encounters'));
router.use('/medications', require('./medications'));
router.use('/prescriptions', require('./prescriptions'));
router.use('/users', require('./users'));
router.use('/auth', require('./auth'));
router.use('/translate', require('./translate'));

router.get('/', (req, res) => res.json({ ok: true, message: 'EMR API' }));

module.exports = router;
