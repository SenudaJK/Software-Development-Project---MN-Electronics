'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class telephones extends Model {
    static associate(models) {
      telephones.belongsTo(models.customers, { foreignKey: 'customer_id', onDelete: 'CASCADE' });
    }
  }

  telephones.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'telephones',
      tableName: 'telephones',
      timestamps: false,
    }
  );

  return telephones;
};