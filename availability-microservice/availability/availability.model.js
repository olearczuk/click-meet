const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const availabilitySchema = new Schema({
    day: { type: Number, required: true },
    start_hour: { type: Number, required: true },
    end_hour: { type: Number, required: true },
    professorId: { type: mongoose.Schema.Types.ObjectId, default: null }
});

module.exports = mongoose.model('Availability', availabilitySchema);