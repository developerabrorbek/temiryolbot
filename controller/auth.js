const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config()

const log = process.env.LOGIN || 'admin'
const pass = process.env.PASSWORD || '15051508'

const login = async (req, res) => {
    if (req.body) {
        let {login, password} = req.body
        if (login !== log){
            return res.status(400).json("Пользователь не найдено")
        }
        if (pass !== password) {
            return res.status(400).json("Пароль на правильно")
        }
        const token = jwt.sign({msg: process.env.secretKey}, process.env.secretKey, {expiresIn: "1d"})        
        res.send({
            success: true,
            token
        })
    }
}

const check = async (req,res) => {
    console.log('ku')
    res.json({msg:'ok'})
}

module.exports = {
    login,
    check
}