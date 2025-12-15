const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('PrescriptionMedication', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    prescriptionId: { type: DataTypes.INTEGER, allowNull: false },
    medicationId: { type: DataTypes.INTEGER, allowNull: false },
    dosage: { type: DataTypes.STRING, allowNull: true },
    frequency: { type: DataTypes.STRING, allowNull: true },
    days: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: 'prescription_medications',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
  });
};
