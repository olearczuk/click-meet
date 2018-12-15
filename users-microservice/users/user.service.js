const bcrypt = require('bcryptjs');
const User = require('../helpers/db').User;

module.exports = {
    authenticate,
    create,
}

async function authenticate({ username, password }) {
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.hash))
        return user;
    return null;
}

async function create(userParams) {
    if (await User.findOne({ username: userParams.username}))
        throw 'Username "' + userParams.username + '" is already taken';
    
    const user = new User(userParams);

    if (userParams.password)
        user.hash = bcrypt.hashSync(userParams.password, 10);
        
    await user.save();
}