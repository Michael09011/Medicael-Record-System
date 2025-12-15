require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const routes = require('./routes');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', routes);

// Export `app` and `sequelize` so server.js can start the server
module.exports = { app, sequelize };
