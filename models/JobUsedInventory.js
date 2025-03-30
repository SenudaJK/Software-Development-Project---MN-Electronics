'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class JobUsedInventory extends Model {
    static associate(models) {
      JobUsedInventory.belongsTo(models.Inventory, { foreignKey: 'Inventory_ID', onDelete: 'CASCADE' });
      JobUsedInventory.belongsTo(models.InventoryBatch, { foreignKey: 'Batch_No', onDelete: 'CASCADE' });
    }
  }

  JobUsedInventory.init(
    {
      Job_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      Inventory_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      Batch_No: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      Quantity_Used: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Total_Amount: {
        type: DataTypes.DECIMAL(15, 2),
      },
    },
    {
      sequelize,
      modelName: 'JobUsedInventory',
      tableName: 'JobUsedInventory',
      timestamps: false,
    }
  );

  return JobUsedInventory;
};