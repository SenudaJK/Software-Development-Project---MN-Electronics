'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class products extends Model {
    static associate(models) {
      products.hasMany(models.jobs, { foreignKey: 'product_id', onDelete: 'CASCADE' });
    }
  }

  products.init(
    {
      product_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      product_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      model: {
        type: DataTypes.STRING(255),
      },
      model_number: {
        type: DataTypes.STRING(255),
      },
      product_image: {
        type: DataTypes.STRING(255),
      },
    },
    {
      sequelize,
      modelName: 'products',
      tableName: 'products',
      timestamps: false,
    }
  );

  return products;
};