const router = require('express').Router();
const { check, validationResult } = require('express-validator/check');
const availabilityService = require('./availability.service');
const availabilityMiddleware = require('./availability.middleware');

router.get('/professor/:professorId', [
    check('professorId').isMongoId(),
], availabilityMiddleware.checkValidationErrors, availabilityMiddleware.isLoggedIn, professorAvailability);

router.get('/', [
    check('day').isInt({ min: 0, max: 4 }),
    check('start_hour').isInt({ min: 0, max: 24 * 60 - 1}),
    check('end_hour').isInt({ min: 0, max: 24 * 60 - 1}),
], availabilityMiddleware.checkValidationErrors,availabilityMiddleware.isLoggedIn, availableProfessors);

router.put('/', [
    check('day').isInt({ min: 0, max: 4 }),
    check('start_hour').isInt({ min: 0, max: 24 * 60 - 1}),
    check('end_hour').isInt({ min: 0, max: 24 * 60 - 1}),
], availabilityMiddleware.checkValidationErrors,availabilityMiddleware.isProfessor, createAvailability);

router.delete('/', [
    check('ids.*').isMongoId(),
], availabilityMiddleware.checkValidationErrors,availabilityMiddleware.isProfessorAndCreator, deleteAvailability);

module.exports = router;

function professorAvailability(req, res, next) {
    availabilityService.professorAvailability(req.params.professorId)
        .then(availability => {
            res.json({
                availability: availability,
            });
        })
        .catch(err => next(err)); 
}

function availableProfessors(req, res, next) {
    availabilityService.availableProfessors(req.query)
        .then(availability => res.status(200).json({
            professors: availability.map(av => av.professorId)
        }))
        .catch(err => next(err));
}

function createAvailability(req, res, next) {
    req.body = {...req.body, professorId: req.session.user}
    availabilityService.createAvailability(req.body)
        .then(availability => res.status(201).json({
            availability: availability,
        }))
        .catch(err => next(err));
}

function deleteAvailability(req, res, next) {
    availabilityService.deleteAvailability(req.body.ids)
        .then(availability => {
            res.status(200).json({
                availability: availability
            });
        })
        .catch(err => next(err));
}

