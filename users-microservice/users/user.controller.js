const router = require('express').Router();
const userService = require('./user.service');

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);

module.exports = router;

function login(req, res, next) {
    userService.authenticate(req.body)
        .then(user => {
            if (!user)
                return res.status(400).json({ message: 'Incorrect input'});
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
