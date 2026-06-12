const jwt = require('jsonwebtoken')

const generateAccessToken = (userId) => {
    return jwt.sign(
        {id : userId},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn : process.env.ACCESS_TOKEN_EXPIRES}
    )
}

const generateRefreshToken = (userId) => {
    return jwt.sign(
        {id : userId},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn : process.env.REFRESH_TOKEN_EXPIRES}
    )
}

module.exports = {generateAccessToken , generateRefreshToken};