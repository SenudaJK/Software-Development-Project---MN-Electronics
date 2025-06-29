'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PurchaseItems extends Model {
    static associate(models) {
      // Define associations
      PurchaseItems.belongsTo(models.Inventory, { foreignKey: 'Inventory_ID', onDelete: 'CASCADE' });
      PurchaseItems.belongsTo(models.InventoryBatch, { foreignKey: 'Batch_No', onDelete: 'CASCADE' });
    }
  }

  PurchaseItems.init(
    {
      Purchase_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      Inventory_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Inventory', // Table name
          key: 'Inventory_ID', // Primary key in Inventory table
        },
      },
      Batch_No: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'InventoryBatch', // Table name
          key: 'Batch_No', // Primary key in InventoryBatch table
        },
      },
      Quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Total_Amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      Purchase_Date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'PurchaseItems',
      tableName: 'PurchaseItems',
      timestamps: false,
    }
  );

  return PurchaseItems;
};