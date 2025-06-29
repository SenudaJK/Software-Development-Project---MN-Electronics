'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    static associate(models) {
      Inventory.hasMany(models.InventoryBatch, { foreignKey: 'Inventory_ID', onDelete: 'CASCADE' });
    }
  }

  Inventory.init(
    {
      Inventory_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      product_name: {
        type: DataTypes.STRING(100),
      },
      stock_limit: { // New field
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // Default stock limit
      },
      last_updated: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      sequelize,
      modelName: 'Inventory',
      tableName: 'Inventory',
      timestamps: false,
    }
  );

  return Inventory;
};