const router = require('express').Router();
const { check } = require('express-validator/check')

const interestService = require('./interest.service');
const interestMiddleware = require('./interest.middleware');

router.post('/', [
    check('title').not().isEmpty()
], interestMiddleware.checkValidationErrors, interestMiddleware.isProfessor, createInterest);

router.get('/', interestMiddleware.isLoggedIn, getInterests);

router.get('/professor/:professorId', [
    check('professorId').isMongoId(),
], interestMiddleware.checkValidationErrors, interestMiddleware.isLoggedIn, getProfessorsInterests);

router.get('/:title', [
    check('title').not().isEmpty()
], interestMiddleware.checkValidationErrors, interestMiddleware.isLoggedIn, getInterestsProfessors);

router.delete('/:id', [
    check('id').isMongoId(),
], interestMiddleware.checkValidationErrors, interestMiddleware.isProfessor, deleteInterest)

module.exports = router

function createInterest(req, res, next) {
    interestService.createInterest({...req.body, professor: req.session.user})
        .then(interest => {
            res.status(201).json({id: interest.id})
        })
        .catch(err => next(err));
}

function getInterests(req, res, next) {
    interestService.getInterests()
        .then(interests => res.status(200).json({
            interests: interests
        }))
        .catch(err => next(err));
}

function getProfessorsInterests(req, res, next) {
    interestService.getProfessorsInterests(req.params.professorId)
        .then(interests => res.status(200).json({
            interests: interests
        }))
        .catch(err => next(err));
}

function getInterestsProfessors(req, res, next) {
    interestService.getInterestsProfessors(req.params.title)
        .then(professors => res.status(200).json({
            professors: professors
        }))
        .catch(err => next(err));
}

function deleteInterest(req, res, next) {
    interestService.deleteInterest(req.params.id, req.session.user)
        .then(interest => res.status(200).json({}))
        .catch(err => next(err));
}
