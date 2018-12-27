const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const reservationSchema = new Schema({
    professorId: { type: ObjectId, required: true },
    studentId: { type: ObjectId },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    topic: { type: String, default: '' },
});

module.exports = mongoose.model('Reservation', reservationSchema);