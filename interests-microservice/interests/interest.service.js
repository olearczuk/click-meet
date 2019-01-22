const Interest = require('../helpers/db').Interest;
const Op = require('sequelize').Op;

module.exports = {
    createInterest,
    getInterests,
    getProfessorsInterests,
    getInterestsProfessors,
    deleteInterest,
}

async function createInterest(body) {
    let professor = body.professor;
    let title = body.title;

    interest = await Interest.findOne({
        where: { title: title }
    });

    if (interest) {
        if (interest.professors.indexOf(professor) != -1)
            throw "You already have such interest";
        interest.professors.push(professor);
        return await interest.save();
    }
    return await Interest.create({title: title, professors: [professor]})
}

async function getInterests() {
    let interests = await Interest.all();
    return interests.map(interest => {
        return {
            title: interest.title,
            id: interest.id,
        }
    });
}

async function getProfessorsInterests(professorIds) {
    let results = [];

    for (let i = 0; i < professorIds.length; i++) {
        let professorId = professorIds[i];
        let interests = await Interest.findAll({
            where: {
                professors: {
                    [Op.contains]: [professorId]
                }
            }
        });

        interests = interests.map(interest => {
            return {
                title: interest.title,
                id: interest.id,
            }
        });
        
        results.push({
            professorId: professorId,
            interests: interests,
        });
    }
    return results;
}

async function getInterestsProfessors(title) {
    let interests = await Interest.findAll({
        where: {
            title: {
                [Op.iLike]: `%${title}%`
            }
        }
    });
    let professors = [];
    
    interests.forEach(el => {
        el.professors.forEach(prof => {
            professors.push(prof.toString());
        });
    });

    return [...new Set(professors)];
}

async function deleteInterest(id, professorId) {
    id = parseInt(id);
    let interest = await Interest.findById(id);

    if (!interest)
        throw "Such interest does not exist"

    let index = interest.professors.indexOf(professorId);

    if (index == -1)
        throw "You don't have such interest";

    interest.professors.splice(index, 1);

    if (interest.professors.length == 0)    
        return Interest.destroy({
            where: {
                id: id
            }
        })
        
    return interest.save();
}

