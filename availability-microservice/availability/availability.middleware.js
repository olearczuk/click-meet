const availabilityService = require('./availability.service');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
    isLoggedIn,
    isProfessor,
    isProfessorAndCreator,
}

function isLoggedIn(req, res, next) {
    if (!req.session.user)
        return res.status(403).json({
            message: 'You need to be logged in',
        });
    next();
}

function isProfessor(req, res, next) {
    if (!req.session.user || !req.session.is_professor)
        return res.status(403).json({
            message: 'You need to be logged in as a professor',
        });
    next();
}

function isProfessorAndCreator(req, res, next) {
    if (!req.session.user || !req.session.is_professor)
        return res.status(403).json({
            message: 'You need to be logged in as a professor',
        });

    availabilityService.getAvailability(req.params.id)
        .then(availability => {
            if (!availability)
                throw "Availability not found"

            if (availability.professorId != req.session.user)
                return res.status(403).json({
                    message: "You can only delete your own availability",
                })

            next();
        })
}   