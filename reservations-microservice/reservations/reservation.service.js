const Reservation = require('../helpers/db').Reservation;
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
    createReservation,
    getReservation,
    deleteReservation,
    getProfessorsReservations,
    getOwnReservations,
    getBusyProfessors,
}

async function createReservation(body) {
    let professorId = ObjectId(body.professorId);
    let studentId = ObjectId(body.studentId);
    let startTime = new Date(body.startTime);
    let endTime = new Date(body.endTime);

    if (endTime <= startTime)
        throw "Malformed time frame - end time should be greater than start time"

    if (startTime <= new Date())
        throw "Malformed time frame - can not create past reservations"

    if (startTime.getFullYear() != endTime.getFullYear() ||
        startTime.getMonth() != endTime.getMonth() ||
        startTime.getDate() != endTime.getDate())
        throw "Reservation has to take place within one day"

    if (startTime.getDay() === 0 || startTime.getDay() === 6)
        throw "Professors are not available in weekends"

    let reservation = await Reservation.
        findOne({ $and: [
            { $or: [
                { professorId: professorId},
                { studentId: studentId },
            ]},
            { startTime: { $lt: endTime }},
            { endTime: { $gt: startTime }}
        ]})
    
    if (reservation)
        throw "Conflicting reservation exists"

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

async function getBusyProfessors(startTime, endTime) {
    let reservations = await Reservation.
        find({ $and: [
            { startTime: { $lt: endTime} },
            { endTime: { $gt: startTime }}
        ]})
    return reservations.map(res => res.professorId);
}