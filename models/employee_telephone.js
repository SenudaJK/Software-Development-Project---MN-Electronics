'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class employee_telephones extends Model {
    static associate(models) {
      employee_telephones.belongsTo(models.employees, { foreignKey: 'employee_id', onDelete: 'CASCADE' });
    }
  }

  employee_telephones.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'employee_telephones',
      tableName: 'employee_telephones',
      timestamps: false,
    }
  );

  return employee_telephones;
};