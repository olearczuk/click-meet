const bcrypt = require('bcryptjs');
const User = require('../helpers/db').User;
const mongoose = require('mongoose');

module.exports = {
    authenticate,
    create,
    findById,
    findUsersByIds,
    getProfessors,
}

async function authenticate({ username, password }) {
    const user = await User.findOne({ username: username });
    if (user && bcrypt.compareSync(password, user.hash))
        return user;
    return null;
}

async function create(userParams) {
    if (await User.findOne({ username: userParams.username}))
        throw 'Username "' + userParams.username + '" is already taken';
    
    if (await User.findOne({ email: userParams.email}))
        throw 'Email "' + userParams.email + '" is already taken';

    const user = new User(userParams);

    user.hash = bcrypt.hashSync(userParams.password, 10);
        
    await user.save();
}

async function findById(id) {
    id = mongoose.Types.ObjectId(id);
    return await User.findById(id);
}

async function findUsersByIds(ids) {
    ids = ids.map(id => mongoose.Types.ObjectId(id));
    return await User.find({
        _id: { $in: ids }
    });
}

async function getProfessors() {
    let professors = await User.find({ professor: true });
    return professors.map(prof => prof.id);
}