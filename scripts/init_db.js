require('dotenv').config();
const mysql = require('mysql2/promise');

async function createDatabaseIfNotExists() {
  const dialect = process.env.DB_DIALECT || 'sqlite';
  if (dialect !== 'mysql') {
    console.log('DB_DIALECT is not mysql — skipping raw database creation.');
    return;
  }

  const host = process.env.DB_HOST || '127.0.0.1';
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
  const user = process.env.DB_USER || 'root';
  const pass = process.env.DB_PASS || '';
  const dbName = process.env.DB_NAME || 'EMR';

  const conn = await mysql.createConnection({ host, port, user, password: pass });
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`Database '${dbName}' ensured.`);
  } finally {
    await conn.end();
  }
}

async function runSeeding() {
  const { sequelize, User, Patient, Encounter } = require('../models');

  // sync models (will create tables and alter to add new columns)
  await sequelize.sync({ alter: true });

  // seed defaults only when empty
  const userCount = await User.count();
  if (userCount === 0) {
    await User.create({ loginId: 'admin', password: 'admin', name: '관리자', role: 'ADMIN', licenseNo: null });
    console.log('Created default admin user: loginId=admin / password=admin');
  } else {
    console.log('Users already exist — skipping user seed.');
  }

  const patientCount = await Patient.count();
  if (patientCount === 0) {
    const p = await Patient.create({ name: '홍길동', birthDate: '1990-01-01', gender: 'M', phone: '010-0000-0000' });
    await Encounter.create({ patientId: p.id, doctorId: null, visitDate: new Date(), visitType: 'OUTPATIENT', status: 'OPEN' });
    console.log('Created sample patient and encounter.');
  } else {
    console.log('Patients already exist — skipping patient seed.');
  }
}

async function main() {
  try {
    await createDatabaseIfNotExists();
    await runSeeding();
    console.log('DB initialization and seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Initialization failed:', err);
    process.exit(1);
  }
}

main();
