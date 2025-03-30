'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class employees extends Model {
    static associate(models) {
      employees.hasMany(models.employee_telephones, { foreignKey: 'employee_id', onDelete: 'CASCADE' });
      employees.hasMany(models.Invoice, { foreignKey: 'Owner_ID', onDelete: 'CASCADE' });
    }
  }

  employees.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('technician', 'owner'),
        allowNull: false,
      },
      nic: {
        type: DataTypes.STRING(12),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'employees',
      tableName: 'employees',
      timestamps: false,
    }
  );

  return employees;
};