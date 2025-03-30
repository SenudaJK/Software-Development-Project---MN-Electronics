'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InventoryBatch extends Model {
    static associate(models) {
      InventoryBatch.belongsTo(models.Inventory, { foreignKey: 'Inventory_ID', onDelete: 'CASCADE' });
    }
  }

  InventoryBatch.init(
    {
      Batch_No: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      Inventory_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Cost_Per_Item: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      Total_Amount: {
        type: DataTypes.DECIMAL(15, 2),
      },
      Purchase_Date: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      sequelize,
      modelName: 'InventoryBatch',
      tableName: 'InventoryBatch',
      timestamps: false,
    }
  );

  return InventoryBatch;
};