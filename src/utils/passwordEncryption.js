const bcrypt = require('bcryptjs');

const generateUserKey = () => {
    return bcrypt.genSaltSync(16);
}

const encryptPassword = async (password, userKey) => {
    const combinedPassword = password + userKey;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(combinedPassword, saltRounds);
    return hashedPassword;
}

const verifyPassword = async (password, userKey, hashedPassword) => {
    const combinedPassword = password + userKey;
    const match = await bcrypt.compare(combinedPassword, hashedPassword);
    return match; // Returns true if the password matches, otherwise false
}

module.exports = {
    generateUserKey,
    encryptPassword,
    verifyPassword,
}