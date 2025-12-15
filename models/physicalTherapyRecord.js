const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('PhysicalTherapyRecord', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    encounterId: { type: DataTypes.INTEGER, allowNull: false },
    therapistId: { type: DataTypes.INTEGER, allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    treatmentDate: { type: DataTypes.DATE, allowNull: false },
    treatmentType: { type: DataTypes.STRING, allowNull: true },
    bodyPart: { type: DataTypes.STRING, allowNull: true },
    durationMin: { type: DataTypes.INTEGER, allowNull: true },
    intensity: { type: DataTypes.ENUM('LOW','MEDIUM','HIGH'), allowNull: true },
    patientResponse: { type: DataTypes.TEXT, allowNull: true },
    note: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'physical_therapy_records',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
  });
};
