'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AdvancePayments extends Model {
    static associate(models) {
      AdvancePayments.belongsTo(models.jobs, { foreignKey: 'Job_ID', onDelete: 'CASCADE' });
      AdvancePayments.belongsTo(models.customers, { foreignKey: 'Customer_ID', onDelete: 'CASCADE' });
    }
  }

  AdvancePayments.init(
    {
      Advance_Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      Job_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Customer_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Owner_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Advance_Amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      Paid_At: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      sequelize,
      modelName: 'AdvancePayments',
      tableName: 'Advance_Payments',
      timestamps: false,
    }
  );

  return AdvancePayments;
};