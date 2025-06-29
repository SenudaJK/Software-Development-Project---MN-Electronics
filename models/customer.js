'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class customers extends Model {
    static associate(models) {
      customers.hasMany(models.telephones, { foreignKey: 'customer_id', onDelete: 'CASCADE' });
      customers.hasMany(models.jobs, { foreignKey: 'customer_id', onDelete: 'CASCADE' });
      customers.hasMany(models.Booking, { foreignKey: 'customer_id', onDelete: 'CASCADE' });
      customers.hasMany(models.Invoice, { foreignKey: 'Customer_ID', onDelete: 'CASCADE' });
    }
  }

  customers.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        // unique: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: true,
        // unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'customers',
      tableName: 'customers',
      timestamps: false,
    }
  );

  return customers;
};