const jwt = require('jsonwebtoken');
require('dotenv').config()

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        console.log(token)
        if (!token) {
            return res.status(401).json("Доступ запрешено");
        }
        req.user = jwt.verify(token, process.env.secretKey)
        next()
    } catch (e) {
        return res.status(401).json("Доступ запрешено")
    }
}


module.exports = {
    auth
}