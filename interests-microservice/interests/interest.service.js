const Interest = require('../helpers/db').Interest;
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
    createInterest,
    getInterests,
    getProfessorsInterests,
    getInterestsProfessors,
    deleteInterest,
}

async function createInterest(body) {
    let professor = ObjectId(body.professor);
    let title = body.title;

    interest = await Interest.findOne({title: title});

    if (interest) {
        if (interest.professors.indexOf(professor) != -1)
            throw "You already have such interest";
        interest.professors.push(professor);
    }
    else 
        interest = new Interest({title: title, professors: [professor]})
    return await interest.save();       
}

async function getInterests() {
    let interests = await Interest.find({});
    return interests.map(interest => {
        return {
            title: interest.title,
            id: interest.id,
        }
    });
}

async function getProfessorsInterests(professorId) {
    let interests = await Interest.find({ professors: ObjectId(professorId) });
    return interests.map(interest => {
        return {
            interest: interest.title,
            id: interest.id,
        }
    });
}

async function getInterestsProfessors(title) {
    let interests = await Interest.find({ title: {'$regex' : `.*${title}.*`, '$options': 'i' }});
    let professors = [];
    
    interests.forEach(el => {
        el.professors.forEach(prof => {
            professors.push(prof.toString());
        });
    });

    return [...new Set(professors)];
}

async function deleteInterest(id, professorId) {
    professorId = ObjectId(professorId);
    id = ObjectId(id);
    let interest = await Interest.findById(id);

    if (!interest)
        throw "Such interest does not exist"

    let index = interest.professors.indexOf(professorId);

    if (index == -1)
        throw "You don't have such interest";

    interest.professors.splice(index, 1);

    if (interest.professors.length == 0)    
        return Interest.findByIdAndDelete(id);
        
    return interest.save();
}

