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
    let start_hour = parseInt(queryParams.start_hour);
    let end_hour = parseInt(queryParams.end_hour);
    let day = parseInt(queryParams.day);
    let professorId = ObjectId(queryParams.professorId); 

    if (queryParams.start_hour >= queryParams.end_hour)
        throw "Malformed time frame";

    let availability = await Availability.
        findOne({$and: [
            { professorId: professorId },
            { day: day },
            { start_hour : { $lt: end_hour }},
            { end_hour : { $gt: start_hour }},
        ]});
    if (availability)
        throw "Conflicting availability already exists";

    let left_neighbour = await Availability.
        findOne({$and: [
            { professorId: professorId },
            { day: day },
            { end_hour: start_hour },
        ]});

    if (left_neighbour) {
        start_hour = left_neighbour.start_hour;
        await Availability.findByIdAndDelete(left_neighbour.id);
    }

    let right_neighbour = await Availability.
        findOne({$and: [
            { professorId: professorId },
            { day: day },
            { start_hour: end_hour },
        ]});
    
    if (right_neighbour) {
        end_hour = right_neighbour.end_hour,
        await Availability.findByIdAndDelete(right_neighbour.id);
    }

    availability = await new Availability({
        professorId: professorId,
        day: day,
        start_hour: start_hour,
        end_hour: end_hour,
    }).save();
    
    return availability;
}

async function professorAvailability(professorId) {
    let availability = await Availability.find({ professorId: ObjectId(professorId) });
    return availability;
}

async function deleteAvailability(ids) {
    ids = [...new Set(ids)];
    let availability = [];
    for (id of ids) {
        let av = await Availability.findByIdAndDelete(ObjectId(id));
        availability.push(av);
    }
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