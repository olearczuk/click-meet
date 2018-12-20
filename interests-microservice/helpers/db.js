const config = require('config.json');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || config.databaseURI, function(err, db) {
    if (err)
        console.log('Failed to connect to database');
    else
        console.log('Successfully connected to database');
});
mongoose.Promise = global.Promise;

module.exports = {
    Interest: require('../interests/interest.model'),
};