require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const PORT = process.env.PORT || 3000
const MONGODB = process.env.MONGO_URI
const routerList = require('./router.js')


const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())


require('./bot')

app.use(routerList)
app.use('/files',express.static('files'))



const dev = async () => {
    try {
        await mongoose.connect(MONGODB).catch(e => {
            console.log(e)
        })
        await app.listen(PORT)
        console.log(`Server ${PORT} is running. MongoDB ${MONGODB} is good`)
    } catch (e) {
        console.log(e)
    }
}

dev()