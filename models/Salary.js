'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Salary extends Model {
    static associate(models) {
      Salary.belongsTo(models.employees, { foreignKey: 'Employee_ID', onDelete: 'CASCADE' });
    }
  }

  Salary.init(
    {
      Salary_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      Employee_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Basic_Salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      Payment_Date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      Overtime_Pay: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      Bonus: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      Deductions: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      Total_Salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Salary',
      tableName: 'Salary',
      timestamps: false,
    }
  );

  return Salary;
};