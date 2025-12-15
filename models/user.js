const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    loginId: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('ADMIN','DOCTOR','NURSE','PT','RADIOLOGIST','OT'), allowNull: false },
    licenseNo: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    birthDate: { type: DataTypes.DATEONLY, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    resetToken: { type: DataTypes.STRING, allowNull: true },
    resetTokenExpiry: { type: DataTypes.BIGINT, allowNull: true }
  }, {
    hooks: {
      // hash password before create/update if changed
      async beforeCreate(user) {
        const bcrypt = require('bcrypt');
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      async beforeUpdate(user) {
        const bcrypt = require('bcrypt');
        try {
          if (typeof user.changed === 'function' ? user.changed('password') : user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        } catch (e) {
          // ignore
        }
      }
    },
    tableName: 'users',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
  });
};
