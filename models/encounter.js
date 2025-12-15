const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Encounter', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    patientId: { type: DataTypes.INTEGER, allowNull: false },
    doctorId: { type: DataTypes.INTEGER, allowNull: true },
    visitDate: { type: DataTypes.DATE, allowNull: false },
    visitType: { type: DataTypes.ENUM('OUTPATIENT','INPATIENT','EMERGENCY'), allowNull: true },
    status: { type: DataTypes.ENUM('OPEN','CLOSED'), allowNull: false, defaultValue: 'OPEN' }
  }, {
    tableName: 'encounters',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
  });
};
