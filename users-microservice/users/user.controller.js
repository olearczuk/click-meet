const router = require('express').Router();
const userService = require('./user.service');
const userMiddleware = require('./user.middleware');
const { check } = require('express-validator/check');

router.post('/login', [
    check('username').not().isEmpty(),
    check('password').not().isEmpty(),
], userMiddleware.checkValidationErrors, userMiddleware.isNotLoggedIn, login);

router.get('/login', userMiddleware.isLoggedIn, getLogin);

router.post('/register', [
    check('username').not().isEmpty(),
    check('password').not().isEmpty(),
    check('email').isEmail(),
], userMiddleware.checkValidationErrors, userMiddleware.isNotLoggedIn, register);

router.post('/logout', userMiddleware.isLoggedIn, logout);

router.get('/info', [
    check('ids').isArray(),
    check('ids.*').isMongoId(),
], userMiddleware.checkValidationErrors, userMiddleware.isLoggedIn, info);

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

function logout(req, res) {
    if (req.session) {
        req.session.destroy(() =>  {
            res.json({});
        });
    }
}

function getLogin(req, res) {
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
}

function info(req, res, next) {
    userService.findUsersByIds(req.query.ids)
        .then(users => {
            users = users.map(user => {
                return {
                    id: user.id,
                    username: user.username,
                    type: user.professor ? 'professor' : 'student',
                }
            });
            res.json(users);
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