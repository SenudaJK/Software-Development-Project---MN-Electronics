'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'Basic_Salary', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('employees', 'Basic_Salary');
  }
};
