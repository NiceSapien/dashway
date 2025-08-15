const { Sequelize } = require('sequelize');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, './config.json'))[env];

const sequelize = new Sequelize(config);

module.exports = sequelize;
