'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    static associate(models) {
      Feedback.belongsTo(models.jobs, { foreignKey: 'Job_ID', onDelete: 'CASCADE' });
    }
  }

  Feedback.init(
    {
      Feedback_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      Job_ID: {
        type: DataTypes.INTEGER,
        unique: true,
      },
      feedback: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: 'Feedback',
      tableName: 'Feedback',
      timestamps: false,
    }
  );

  return Feedback;
};
