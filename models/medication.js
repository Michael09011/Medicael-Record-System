const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Medication', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    unit: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'medications',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
  });
};
