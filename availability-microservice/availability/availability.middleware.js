const availabilityService = require('./availability.service');
const { validationResult } = require('express-validator/check');

module.exports = {
    isLoggedIn,
    isProfessor,
    isProfessorAndCreator,
    checkValidationErrors,
}

function isLoggedIn(req, res, next) {
    if (!req.session.user)
        return res.status(403).json({
            message: 'You need to be logged in',
        });
    next();
}

function isProfessor(req, res, next) {
    isLoggedIn(req, res, () => {
        if (!req.session.is_professor)
            return res.status(403).json({
                message: 'You need to be logged in as a professor'
            })
        next();
    });
}

function isProfessorAndCreator(req, res, next) {
    isProfessor(req, res, () => {
        availabilityService.getAvailability(req.params.id)
            .then(availability => {
                if (!availability)
                    return res.status(400).json({
                        message: "Availability not found"
                    })

                if (availability.professorId != req.session.user)
                    return res.status(403).json({
                        message: "You can only delete your own availability",
                    })

                next();
            });
    });
}   

function checkValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let message = "Parameters with wrong values: ";
        errors.array().forEach((el, index, arr) => {
            message += el.param;
            if (index < arr.length - 1)
                message += ', ';
        });
        return res.status(400).json({ message: message });
    }
    next();
}