'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    static associate(models) {
      Invoice.belongsTo(models.jobs, { foreignKey: 'Job_ID', onDelete: 'CASCADE' });
      Invoice.belongsTo(models.customers, { foreignKey: 'Customer_ID', onDelete: 'CASCADE' });
      Invoice.belongsTo(models.employees, { foreignKey: 'Owner_ID', onDelete: 'CASCADE' });
    }
  }

  Invoice.init(
    {
      Invoice_Id: {
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
        allowNull: true, // Optional
      },
      TotalCost_for_Parts: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true, // Optional
      },
      Labour_Cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true, // Optional
      },
      Total_Amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true, // Optional
      },
      warranty_eligible: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      Warranty_Expiry: {
        type: DataTypes.DATE, // Add the Warranty_Expiry column
        allowNull: true, // Optional, as not all invoices may have a warranty
      },
      Created_At: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      sequelize,
      modelName: 'Invoice',
      tableName: 'Invoice',
      timestamps: false,
    }
  );

  return Invoice;
};