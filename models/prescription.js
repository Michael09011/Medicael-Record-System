const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Prescription', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    encounterId: { type: DataTypes.INTEGER, allowNull: false },
    doctorId: { type: DataTypes.INTEGER, allowNull: true },
    note: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'prescriptions',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
  });
};
