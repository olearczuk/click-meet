const router = require('express').Router()
const reservationService = require('./reservation.service');
const reservationMiddleware = require('./reservation.middleware');
const { check } = require('express-validator/check')
const rabbitService = require('../helpers/rabbitmq');

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
    check('startTime').isISO8601(),
    check('endTime').isISO8601(),
], reservationMiddleware.checkValidationErrors, reservationMiddleware.isLoggedIn, getProfessorsReservations);

router.get('/reservations/personal', [
    check('startTime').isISO8601(),
    check('endTime').isISO8601(),
], reservationMiddleware.checkValidationErrors, reservationMiddleware.isLoggedIn, getOwnReservations);

router.get('/', reservationMiddleware.isLoggedIn, getBusyProfessors);

module.exports = router

function createStudentsReservation(req, res, next) {
    reservationService.createReservation({...req.body, studentId: req.session.user})
        .then(reservation => {
            reservationService.fetchUserInfo(req.body.professorId, req.headers.cookie, res)
                .then(response => {
                    rabbitService.send({
                        email: response.email,
                        html: createStudentsReservationEmailTemplate(
                            response.username,
                            reservation.topic,
                            new Date(reservation.startTime).toUTCString(),
                            new Date(reservation.endTime).toUTCString())
                    });
                    res.status(201).json({ id: reservation.id });
                })
        })
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
        .then(reservation => {
            if (reservation.studentId) {
                reservationService.fetchUserInfo(reservation.studentId, req.headers.cookie, res)
                .then(response => {
                    rabbitService.send({
                        email: response.email,
                        html: deleteReservationEmailTemplate(
                            response.username,
                            reservation.topic,
                            new Date(reservation.startTime).toUTCString(),
                            new Date(reservation.endTime).toUTCString())
                    });
                    res.status(201).json({});
                })
            } else
                res.status(200).json({})
        })
        .catch(err => next(err));
}

function getProfessorsReservations(req, res, next) {
    reservationService.getProfessorsReservations(req.params.professorId, req.query.startTime, req.query.endTime)
        .then(reservations => res.status(200).json({
            reservations: reservations.map(res => {
                if (res.studentId != req.session.user && res.professorId != req.session.user)
                    return {
                        startTime: res.startTime,
                        endTime: res.endTime,
                    };
                return res;
            })
        }))
        .catch(err => next(err));
}

function getOwnReservations(req, res, next) {
    reservationService.getOwnReservations(req.session.user, req.query.startTime, req.query.endTime)
        .then(reservations => res.status(200).json({
            reservations: reservations,
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

function createStudentsReservationEmailTemplate(username, topic, startTime, endTime) {
    return  `   <html> <table width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="red">  `  +
            `     <tr>  `  +
            `       <td align="center" valign="top" width="100%" style="background: linear-gradient(to bottom, #f0cb35 0%, #c02425 100%); padding: 50px;">  `  +
            `                   <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 650px;">  `  +
            `                       <tr>  `  +
            `                           <td align="center" cellpadding="0" cellspacing="0" style="text-align: center; padding-bottom: 30px; color: #fff; font-family: Arial, serif; font-size: 32px;">  `  +
            `                               click&meet  `  +
            `                           </td>  `  +
            `                       </tr>  `  +
            `                      <tr>  `  +
            `                           <td align="center" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; font-size: 18px; border-radius: 3px; background: #fff; box-shadow: 0 0 20px 0 rgba(0,0,0,.3); padding: 15px 60px; margin: 15px;">  `  +
            `                               <table width="100%" cellpadding="0" cellspacing="0">  `  +
            `                                 <tr>  `  +
            `                                   <td align="center" cellpadding="0" cellspacing="0" style="text-align: center; padding: 25px; font-family: Arial, serif; font-size: 22px;">Hello ${username}</td>  `  +
            `                                 </tr>  `  +
            `                                 <tr>  `  +
            `                                   <td align="left" cellpadding="0" cellspacing="0" style="text-align: left; padding-bottom: 10px; font-family: Arial, serif; font-size: 18px;">One of the students has just arranged a meeting with you. Meeting title is "${topic}". It starts at ${startTime} and ends at ${endTime}.</td>  `  +
            `                                 </tr>  `  +
            `                                 <tr>  `  +
            `                                   <td align="left" cellpadding="0" cellspacing="0" style="text-align: left; padding-bottom: 30px; font-family: Arial, serif; font-size: 18px;">If you cannot participate delete the meeting in your calendar.</td>  `  +
            `                                 </tr>  `  +
            `                                 <tr>  `  +
            `                                   <td align="right" cellpadding="0" cellspacing="0" style="text-align: right; padding-bottom: 30px; font-family: Arial, serif; font-size: 18px;">Best regards,<br/>  `  +
            `                                     click&meet service  `  +
            `                                   </td>  `  +
            `                                 </tr>  `  +
            `                         </td>  `  +
            `                       </tr>  `  +
            `                   </table>  `  +
            `           </td>  `  +
            `       </tr>  `  +
            `  </table> </html>` ;
}

function deleteReservationEmailTemplate(username, topic, startTime, endTime) {
    return  `   <table width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="red">  `  +
        `     <tr>  `  +
        `       <td align="center" valign="top" width="100%" style="background: linear-gradient(to bottom, #f0cb35 0%, #c02425 100%); padding: 50px;">  `  +
        `                   <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 650px;">  `  +
        `                       <tr>  `  +
        `                           <td align="center" cellpadding="0" cellspacing="0" style="text-align: center; padding-bottom: 30px; color: #fff; font-family: Arial, serif; font-size: 32px;">  `  +
        `                               click&meet  `  +
        `                           </td>  `  +
        `                       </tr>  `  +
        `                       <tr>  `  +
        `                           <td align="center" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; font-size: 18px; border-radius: 3px; background: #fff; box-shadow: 0 0 20px 0 rgba(0,0,0,.3); padding: 15px 60px; margin: 15px;">  `  +
        `                               <table width="100%" cellpadding="0" cellspacing="0">  `  +
        `                                 <tr>  `  +
        `                                   <td align="center" cellpadding="0" cellspacing="0" style="text-align: center; padding: 25px; font-family: Arial, serif; font-size: 22px;">Hello ${username}</td>  `  +
        `                                 </tr>  `  +
        `                                 <tr>  `  +
        `                                   <td align="left" cellpadding="0" cellspacing="0" style="text-align: left; padding-bottom: 10px; font-family: Arial, serif; font-size: 18px;">One of the professors has just deleted a meeting with you. Meeting title was "${topic}". It supposed to start at ${startTime} and end at ${endTime}.</td>  `  +
        `                                 </tr>  `  +
        `                                 <tr>  `  +
        `                                   <td align="left" cellpadding="0" cellspacing="0" style="text-align: left; padding-bottom: 30px; font-family: Arial, serif; font-size: 18px;">Try to look for another professor - maybe he has free place in his calendar!</td>  `  +
        `                                 </tr>  `  +
        `                                 <tr>  `  +
        `                                   <td align="right" cellpadding="0" cellspacing="0" style="text-align: right; padding-bottom: 30px; font-family: Arial, serif; font-size: 18px;">Best regards,<br/>  `  +
        `                                     click&meet service  `  +
        `                                   </td>  `  +
        `                                 </tr>  `  +
        `                         </td>  `  +
        `                       </tr>  `  +
        `                   </table>  `  +
        `           </td>  `  +
        `       </tr>  `  +
        `  </table>  ` ;
}