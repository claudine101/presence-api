const express = require('express')
const user_routes=require('./users.routes')

const administrationRouter=express.Router()

administrationRouter.use('/users',user_routes)

module.exports = administrationRouter

