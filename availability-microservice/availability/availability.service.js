const Availability = require('../helpers/db').Availability;
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
    createAvailability,
    professorAvailability,
    deleteAvailability,
    availableProfessors,
    getAvailability,
}

async function createAvailability(queryParams) {
    queryParams.start_hour = parseInt(queryParams.start_hour);
    queryParams.end_hour = parseInt(queryParams.end_hour);
    queryParams.day = parseInt(queryParams.day);

    if (queryParams.start_hour >= queryParams.end_hour)
        throw "Malformed time frame";

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
    availability = await new Availability(queryParams).save();
    return availability;
}

async function professorAvailability(professorId) {
    let availability = await Availability.find({ professorId: ObjectId(professorId) });
    return availability;
}

async function deleteAvailability(id) {
    let availability = await Availability.findByIdAndDelete(ObjectId(id));
    return availability;
}

async function availableProfessors(query) {
    return await Availability.
        find({$and: [
                {day: query.day},
                {$and: [
                    {start_hour : { $lte: query.start_hour}},
                    {end_hour : { $gte: query.end_hour}},
                ]}
        ]});
}

async function getAvailability(id) {
    return Availability.findById(id);
}