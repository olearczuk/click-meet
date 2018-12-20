const Availability = require('../helpers/db').Availability;
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
    createAvailability,
    professorAvailability,
    deleteAvailability,
    getAvailability,
    availableProfessors,
}

async function createAvailability(queryParams) {
    queryParams.start_hour = parseInt(queryParams.start_hour);
    queryParams.end_hour = parseInt(queryParams.end_hour);
    queryParams.day = parseInt(queryParams.day);

    if (queryParams.start_hour >= queryParams.end_hour)
        throw "Malformed time frame";

    if (queryParams.start_hour > 60 * 24 || queryParams.end_hour < 0)
        throw "Malformed hours - should be between 0 and 1440"

    if (queryParams.day < 0 || queryParams.day > 4)
        throw "Malformed time  - should be in [0, 4]"

    let availability = await Availability.
        findOne({$and: [
            {professorId: ObjectId(queryParams.professorId)},
            {day: queryParams.day},
            {$and: [
                {start_hour : { $lt: queryParams.end_hour }},
                {end_hour : { $gt: queryParams.start_hour }},
            ]}
        ]});
    if (availability)
        throw "Conflicting availability already exists";
    availability = new Availability(queryParams);
    return await availability.save();
}

async function professorAvailability(professorId) {
    return await Availability.find({ professorId: ObjectId(professorId) });
}

async function deleteAvailability(id) {
    return await Availability.findByIdAndDelete(ObjectId(id));
}

async function getAvailability(id) {
    return await Availability.findById(ObjectId(id));
}

async function availableProfessors(query) {
    return await Availability.
        find({$and: [
                {day: query.day},
                {$and: [
                    {start_hour : { $gte: query.start_hour}},
                    {end_hour : { $lte: query.end_hour}},
                ]}
        ]});
}