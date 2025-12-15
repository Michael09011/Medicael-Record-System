const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('MedicalRecord', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    encounterId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    subjective: { type: DataTypes.TEXT, allowNull: true },
    objective: { type: DataTypes.TEXT, allowNull: true },
    assessment: { type: DataTypes.TEXT, allowNull: true },
    plan: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'medical_records',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
  });
};
