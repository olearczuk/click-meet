const { validationResult } = require('express-validator/check');

module.exports = {
    isLoggedIn,
    isNotLoggedIn,
    checkValidationErrors,
}

function isLoggedIn(req, res, next) {
    if (!req.session.user)
        return res.status(403).json({
            message: 'You need to be logged in',
        });
    next();
}

function isNotLoggedIn(req, res, next) {
    if (req.session.user)
        return res.status(403).json({
            message: 'You have to be logged out',
        });
    next();
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
