const router = require('express').Router();
const userService = require('./user.service');
const userPermissions = require('./user.permissions');

router.post('/login', login);
router.post('/register', register);
router.post('/logout', userPermissions.isLoggedIn,logout);
router.get('/:id/info', userPermissions.isLoggedIn, info);

module.exports = router;

function login(req, res, next) {
    userService.authenticate(req.body)
        .then(user => {
            if (!user)
                throw 'Incorrect input'
            if (!req.session.user)
                req.session.user = user.id;
            res.json({
                user: req.session.user
            });
        })
        .catch(err => next(err)); 
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function logout(req, res, next) {
    if (req.session) {
        req.session.destroy(function (done) {
            res.json({});
        });
    }
}

function info(req, res, next) {
    userService.findById(req.params.id)
        .then(user => {
            if (!user)
                throw 'User not found';
            res.json({
                username: user.username,
                type: user.professor ? 'professor' : 'student',
            });
        })
        .catch(err => next(err));
}