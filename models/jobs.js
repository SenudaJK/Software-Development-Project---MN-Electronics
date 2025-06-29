'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class jobs extends Model {
    static associate(models) {
      jobs.belongsTo(models.products, { foreignKey: 'product_id', onDelete: 'CASCADE' });
      jobs.belongsTo(models.customers, { foreignKey: 'customer_id', onDelete: 'CASCADE' });
      jobs.belongsTo(models.employees, { foreignKey: 'assigned_employee', onDelete: 'SET NULL' }); // New association
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
      assigned_employee: { // New column
        type: DataTypes.INTEGER,
        references: {
          model: 'employees', // Table name
          key: 'id', // Primary key in employees table
        },
        allowNull: true, // Allow null if no employee is assigned
      },
      repair_description: {
        type: DataTypes.TEXT,
      },
      repair_status: {
        type: DataTypes.ENUM(
          'Booking Pending',
          'Booking Approved',
          'Booking Cancelled',
          'Pending',
          'Cannot Repair',
          'In Progress',
          'Completed',
          'Paid',
          'Warranty-Claimed'
        ),
        defaultValue: 'Pending',
        allowNull: false,
      },
      warranty_eligible: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },      handover_date: {
        type: DataTypes.DATE,
      },
      completion_date: {
        type: DataTypes.DATE,
        allowNull: true,
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
