module.exports = {
    isLoggedIn,
}

function isLoggedIn(req, res, next) {
    if (!req.session.user)
        return res.status(403).json({
            message: 'You need to be logged in',
        });
    next();
}