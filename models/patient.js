const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Patient', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    birthDate: { type: DataTypes.DATEONLY, allowNull: true },
    gender: { type: DataTypes.ENUM('M','F','O'), allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    insuranceType: { type: DataTypes.STRING, allowNull: true }
  }, {
    tableName: 'patients',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
  });
};
