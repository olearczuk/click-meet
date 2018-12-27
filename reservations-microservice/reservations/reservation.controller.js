const router = require('express').Router()
const reservationService = require('./reservation.service');
const reservationMiddleware = require('./reservation.middleware');

router.put('/student', reservationMiddleware.isStudent, createStudentsReservation);
router.put('/professor', reservationMiddleware.isProfessor, createProfessorsReservation);
router.get('/:id', reservationMiddleware.isLoggedIn, getReservation);
router.delete('/:id', reservationMiddleware.isLoggedInAndParticipant, deleteReservation);
router.get('/professor/:professorId', reservationMiddleware.isLoggedIn, getProfessorsReservations);
router.get('/', reservationMiddleware.isLoggedIn, getOwnReservations);

module.exports = router

// TODO
// 1. Check if professorId truly belongs to a professor (users-microservice)
// 2. Check if professor is available in such day in such hours (availability-microservice)
function createStudentsReservation(req, res, next) {
    reservationService.createReservation({...req.body, studentId: req.session.user})
        .then(reservation =>res.status(201).json({ id: reservation.id }))
        .catch(err => next(err));
}

function createProfessorsReservation(req, res, next) {
    reservationService.createReservation({...req.body, studentId: null, professorId: req.session.user})
        .then(reservation => res.status(201).json({ id: reservation.id }))
        .catch(err => next(err));
}

function getReservation(req, res, next) {
    reservationService.getReservation(req.params.id)
        .then(reservation => {
            if (!reservation)
                throw "Reservation not found";

            if (reservation.studentId != req.session.user && reservation.professorId != req.session.user)
                reservation = {
                    startTime: reservation.startTime,
                    endTime: reservation.endTime,
                }

            res.status(200).json({
                reservaton: reservation
            });
        })
        .catch(err => next(err));
}

function deleteReservation(req, res, next) {
    reservationService.deleteReservation(req.params.id)
        .then(reservation => res.status(200).json({}))
        .catch(err => next(err));
}

function getProfessorsReservations(req, res, next) {
    reservationService.getProfessorsReservations(req.params.professorId, req.query.startTime, req.query.endTime)
        .then(reservations => res.status(200).json({
            reservations: reservations.map(res => res.id)
        }))
        .catch(err => next(err));
}

function getOwnReservations(req, res, next) {
    reservationService.getOwnReservations(req.session.user, req.query.startTime, req.query.endTime)
        .then(reservations => res.status(200).json({
            reservations: reservations.map(res => res.id)
        }))
        .catch(err => next(err));
}




