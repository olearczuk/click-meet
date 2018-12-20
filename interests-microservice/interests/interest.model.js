const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const interestSchema = new Schema({
    title: { type: String, required: true, unique: true },
    professors: { type: [mongoose.Schema.Types.ObjectId], default: [] }
})

module.exports = mongoose.model('Interest', interestSchema);