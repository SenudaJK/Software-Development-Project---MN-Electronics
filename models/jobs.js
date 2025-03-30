'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class jobs extends Model {
    static associate(models) {
      jobs.belongsTo(models.products, { foreignKey: 'product_id', onDelete: 'CASCADE' });
      jobs.belongsTo(models.customers, { foreignKey: 'customer_id', onDelete: 'CASCADE' });
      jobs.hasMany(models.Booking, { foreignKey: 'job_id', onDelete: 'CASCADE' });
      jobs.hasOne(models.Feedback, { foreignKey: 'Job_ID', onDelete: 'CASCADE' });
      jobs.hasOne(models.Invoice, { foreignKey: 'Job_ID', onDelete: 'CASCADE' });
    }
  }

  jobs.init(
    {
      job_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      product_id: {
        type: DataTypes.INTEGER,
      },
      customer_id: {
        type: DataTypes.INTEGER,
      },
      repair_description: {
        type: DataTypes.TEXT,
      },
      repair_status: {
        type: DataTypes.ENUM('Pending', 'In Progress', 'Completed'),
        defaultValue: 'Pending',
      },
      warranty_eligible: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      handover_date: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'jobs',
      tableName: 'jobs',
      timestamps: false,
    }
  );

  return jobs;
};
