const router = require('express').Router();
const availabilityService = require('./availability.service');
const availabilityMiddleware = require('./availability.middleware');

router.get('/professor/:professorId', availabilityMiddleware.isLoggedIn, professorAvailability);
router.get('/', availabilityMiddleware.isLoggedIn, availableProfessors);
router.put('/', availabilityMiddleware.isProfessor, createAvailability);
router.delete('/:id', availabilityMiddleware.isProfessorAndCreator, deleteAvailability);

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
        .then(professors => res.status(200).json({
            professors: professors.map(prof => prof._id)
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
    availabilityService.deleteAvailability(req.params.id)
        .then(availability => {
            res.status(200).json({
                availability: availability
            });
        })
        .catch(err => next(err));
}