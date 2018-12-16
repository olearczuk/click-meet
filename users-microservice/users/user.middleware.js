module.exports = {
    isLoggedIn,
    isNotLoggedIn,
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
