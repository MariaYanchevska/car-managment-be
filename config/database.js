const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
    dialect: 'sqlite',
    storage: ':memory:'
});

module.exports = sequelize; 