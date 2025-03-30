'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.jobs, { foreignKey: 'job_id', onDelete: 'CASCADE' });
      Booking.belongsTo(models.customers, { foreignKey: 'customer_id', onDelete: 'CASCADE' });
    }
  }

  Booking.init(
    {
      BookingID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      Time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Booking',
      tableName: 'Booking',
      timestamps: false,
    }
  );

  return Booking;
};