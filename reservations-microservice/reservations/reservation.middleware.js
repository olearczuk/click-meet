const reservationService = require('./reservation.service');
const fetch = require('node-fetch');
const config = require('config.json');

module.exports = {
    isLoggedIn,
    isProfessor,
    isStudent,
    isLoggedInAndParticipant,
    isProfessorId,
    isProfessorAvailable,
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

async function isProfessorId(req, res, next) {
    let professorId = req.body.professorId;
    let cookie = req.headers.cookie;

    let users_url = process.env.USERS_URL | config.usersMicroserviceURL;

    let response = await fetch(users_url + professorId + "/info", {
        headers: {
            cookie: cookie
        }
    });

    if (response.status === 400)
        return res.status(403).json({
            message: "Given professorId does not belong to professor"
        });

    const json = await response.json();

    if (json.type != 'professor')
        return res.status(403).json({
            message: "Given professorId does not belong to professor"
        });
    next();
}

async function isProfessorAvailable(req, res, next) {
    let professorId = req.session.is_professor ? req.session.user : req.body.professorId;
    let cookie = req.headers.cookie;
    
    let startTime = new Date(req.body.startTime);
    let endTime = new Date(req.body.endTime);

    let start_hour = 60 * startTime.getHours() + startTime.getMinutes();
    let end_hour = 60 * endTime.getHours() + endTime.getMinutes();
    let day = startTime.getDay() - 1;

    let availability_url = process.env.AVAILABILITY_URL | config.availabilityMicroserviceURL;

    let url = availability_url + "?day=" + day.toString() + 
        "&start_hour=" + start_hour.toString() + "&end_hour=" + end_hour.toString();

    let response = await fetch(url, {
        headers: {
            cookie: cookie,
        },
        query: {
            day: startTime.getDate() - 1,
            start_hour: 60 * startTime.getHours() + startTime.getMinutes(),
            end_hour:  60 * endTime.getHours() + endTime.getMinutes(),
        }
    });

    const json = await response.json();

    if (json.professors.indexOf(professorId) === -1)
        return res.status(400).json({
            message: "Professor is not available in such hours"
        });

    next();
}