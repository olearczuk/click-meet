const router = require('express').Router();
const userService = require('./user.service');
const userMiddleware = require('./user.middleware');

router.post('/login', userMiddleware.isNotLoggedIn, login);
router.get('/login', isLoggedIn);
router.post('/register', userMiddleware.isNotLoggedIn, register);
router.post('/logout', userMiddleware.isLoggedIn, logout);
router.get('/:id/info', userMiddleware.isLoggedIn, info);
router.get('/professors', userMiddleware.isLoggedIn, getProfessors)

module.exports = router;

function login(req, res, next) {
    userService.authenticate(req.body)
        .then(user => {
            if (!user)
                throw 'Incorrect input'
                
            req.session.user = user.id;
            req.session.is_professor = user.professor;

            res.json({
                id: req.session.user,
                username: user.username,
                email: user.email,
                professor: user.professor
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

function isLoggedIn(req, res, next) {
    if (req.session.user) {
        userService.findById(req.session.user)
            .then(user => {
                if (!user)
                    throw 'User not found';
                res.json({
                    id: req.session.user,
                    username: user.username,
                    email: user.email,
                    professor: user.professor
                })
            })
            .catch(err => next(err));
    } else {
        res.json({});
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

function getProfessors(req, res, next) {
    userService.getProfessors()
        .then(professors => {
            res.json({
                professors: professors,
            })
        })
        .catch(err => next(err));
}