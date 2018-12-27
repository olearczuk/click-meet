const reservationService = require('./reservation.service');

module.exports = {
    isLoggedIn,
    isProfessor,
    isStudent,
    isLoggedInAndParticipant,
}

function isLoggedIn(req, res, next) {
    if (!req.session.user)
        return res.status(403).json({
            message: "You need to be logged in",
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

function isStudent(req, res, next) {
    isLoggedIn(req, res, () => {
        if (req.session.is_professor)
            return res.status(403).json({
                message: 'You need to be logged in as a student'
            })
        next();
    })
}

function isLoggedInAndParticipant(req, res, next) {
    isLoggedIn(req, res, () => {
        reservationService.getReservation(req.params.id)
            .then(reservation => {
                if (!reservation)
                    return res.status(400).json({
                        message: 'Reservation not found'
                    });

                if (reservation.studentId != req.session.user && reservation.professorId != req.session.user)
                    return res.status(403).json({
                        message: 'You have to be participant of this reservation'
                    });

                next();
            })
    });
}