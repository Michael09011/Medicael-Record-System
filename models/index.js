const { Sequelize } = require('sequelize');
const path = require('path');

const dialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;
if (dialect === 'mysql') {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = process.env.DB_PORT || 3306;
  const database = process.env.DB_NAME || 'emr';
  const username = process.env.DB_USER || 'root';
  const password = process.env.DB_PASS || '';
  sequelize = new Sequelize(database, username, password, {
    host,
    port,
    dialect: 'mysql',
    logging: false
  });
} else {
  const storage = process.env.DB_STORAGE || path.join(__dirname, '..', 'database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false
  });
}

const User = require('./user')(sequelize);
const Patient = require('./patient')(sequelize);
const Encounter = require('./encounter')(sequelize);
const MedicalRecord = require('./medicalRecord')(sequelize);
const Medication = require('./medication')(sequelize);
const Prescription = require('./prescription')(sequelize);
const PrescriptionMedication = require('./prescriptionMedication')(sequelize);
const PhysicalTherapyRecord = require('./physicalTherapyRecord')(sequelize);
const OccupationalTherapyRecord = require('./occupationalTherapyRecord')(sequelize);

// Associations
Patient.hasMany(Encounter, { foreignKey: 'patientId' });
Encounter.belongsTo(Patient, { foreignKey: 'patientId' });

User.hasMany(Encounter, { foreignKey: 'doctorId' });
Encounter.belongsTo(User, { foreignKey: 'doctorId' });

Encounter.hasMany(MedicalRecord, { foreignKey: 'encounterId' });
MedicalRecord.belongsTo(Encounter, { foreignKey: 'encounterId' });
// MedicalRecord author
User.hasMany(MedicalRecord, { foreignKey: 'userId' });
MedicalRecord.belongsTo(User, { foreignKey: 'userId' });

Encounter.hasMany(Prescription, { foreignKey: 'encounterId' });
Prescription.belongsTo(Encounter, { foreignKey: 'encounterId' });

Prescription.belongsTo(User, { foreignKey: 'doctorId' });
User.hasMany(Prescription, { foreignKey: 'doctorId' });

Medication.belongsToMany(Prescription, { through: PrescriptionMedication, foreignKey: 'medicationId' });
Prescription.belongsToMany(Medication, { through: PrescriptionMedication, foreignKey: 'prescriptionId' });

// explicit join-model associations for easier include of dosage/frequency
Prescription.hasMany(PrescriptionMedication, { foreignKey: 'prescriptionId' });
PrescriptionMedication.belongsTo(Prescription, { foreignKey: 'prescriptionId' });
Medication.hasMany(PrescriptionMedication, { foreignKey: 'medicationId' });
PrescriptionMedication.belongsTo(Medication, { foreignKey: 'medicationId' });

Encounter.hasMany(PhysicalTherapyRecord, { foreignKey: 'encounterId' });
PhysicalTherapyRecord.belongsTo(Encounter, { foreignKey: 'encounterId' });
// PhysicalTherapyRecord author and type
User.hasMany(PhysicalTherapyRecord, { foreignKey: 'userId' });
PhysicalTherapyRecord.belongsTo(User, { foreignKey: 'userId' });

Encounter.hasMany(OccupationalTherapyRecord, { foreignKey: 'encounterId' });
OccupationalTherapyRecord.belongsTo(Encounter, { foreignKey: 'encounterId' });
// OccupationalTherapyRecord author
User.hasMany(OccupationalTherapyRecord, { foreignKey: 'userId' });
OccupationalTherapyRecord.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Patient,
  Encounter,
  MedicalRecord,
  Medication,
  Prescription,
  PrescriptionMedication,
  PhysicalTherapyRecord
  ,OccupationalTherapyRecord
};
