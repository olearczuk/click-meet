const Reservation = require('../helpers/db').Reservation;
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
    createReservation,
    getReservation,
    deleteReservation,
    getProfessorsReservations,
    getOwnReservations,
}
// TODO
// should startTime and endTime occur in the same day?
async function createReservation(body) {
    let professorId = ObjectId(body.professorId);
    let startTime = new Date(body.startTime);
    let endTime = new Date(body.endTime);

    console.log(startTime, endTime);

    if (endTime <= startTime)
        throw "Malformed time frame - end time should be greater than start time"

    if (startTime <= new Date())
        throw "Malformed time frame - can not create past reservations"

    let reservation = await Reservation.
        findOne({ $and: [
            { professorId: ObjectId(professorId) },
            { startTime: { $lt: endTime }},
            { endTime: { $gt: startTime }}
        ]})

    if (reservation)
        throw "Conflicting reservation already exists";

    reservation = await new Reservation(body).save();
    return reservation;
}

async function getReservation(id) {
    return await Reservation.findById(id);
}

async function deleteReservation(id) {
    return Reservation.findByIdAndDelete(id);
}

async function getProfessorsReservations(professorId, startTime, endTime) {
    return await Reservation.
        find({ $and: [
            { professorId: ObjectId(professorId) },
            { startTime: { $gte: startTime } },
            { endTime: { $lte: endTime } }
        ]})
}

async function getOwnReservations(userId, startTime, endTime) {
    return await Reservation.
        find({ $and: [
            { $or: [
                { professorId: ObjectId(userId) },
                { studentId: ObjectId(userId) }
            ]},
            { startTime: { $gte: startTime } },
            { endTime: { $lte: endTime } }
        ]})
}
