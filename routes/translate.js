const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Proxy to LibreTranslate (public instance)
router.post('/', async (req, res) => {
  try {
    const { q, source = 'auto', target } = req.body;
    if (!q || !target) return res.status(400).json({ error: 'q and target are required' });

    const resp = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, source, target, format: 'text' })
    });

    const json = await resp.json();
    return res.json(json);
  } catch (err) {
    console.error('Translate proxy error:', err);
    return res.status(500).json({ error: 'Translation failed' });
  }
});

module.exports = router;
