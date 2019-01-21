const config = require('config.json');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('interests_db', 'postgres', 'postgres', {
    host: 'postgresql-interests',
    dialect: 'postgres',

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: false
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

const Interest = sequelize.define('interests', {
    title: Sequelize.TEXT,
    professors: Sequelize.ARRAY(Sequelize.CHAR(24)),
  }, {
    timestamps: false
  });

module.exports = {
    Interest: Interest,
};