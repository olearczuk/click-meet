const router = require('express').Router()
const reservationService = require('./reservation.service');
const reservationMiddleware = require('./reservation.middleware');
const { check } = require('express-validator/check')

router.put('/student', [
    check('professorId').isMongoId(),
    check('startTime').isISO8601(),
    check('endTime').isISO8601(),
], reservationMiddleware.checkValidationErrors, reservationMiddleware.isStudent, reservationMiddleware.isProfessorId, 
   reservationMiddleware.isProfessorAvailable, createStudentsReservation);

router.put('/professor', [
    check('startTime').isISO8601(),
    check('endTime').isISO8601(),
], reservationMiddleware.checkValidationErrors, reservationMiddleware.isProfessor, 
   reservationMiddleware.isProfessorAvailable, createProfessorsReservation);

router.get('/:id', [
    check('id').isMongoId(),
], reservationMiddleware.checkValidationErrors, reservationMiddleware.isLoggedIn, getReservation);

router.delete('/:id', [
    check('id').isMongoId(),
], reservationMiddleware.checkValidationErrors, reservationMiddleware.isLoggedInAndParticipant, deleteReservation);

router.get('/professor/:professorId', [
    check('professorId').isMongoId(),
], reservationMiddleware.checkValidationErrors, reservationMiddleware.isLoggedIn, getProfessorsReservations);

router.get('/personal', reservationMiddleware.isLoggedIn, getOwnReservations);

router.get('/', reservationMiddleware.isLoggedIn, getBusyProfessors);

module.exports = router

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

function getBusyProfessors(req, res, next) {
    reservationService.getBusyProfessors(req.query.startTime, req.query.endTime)
        .then(professors => res.status(200).json({
            professors: professors
        }))
        .catch(err => next(err));
}




