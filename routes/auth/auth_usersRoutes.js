const express = require('express')
const auth_users_routes=require('./auth_users.routes')
const auth_usersRouter=express.Router()

auth_usersRouter.use('/users',auth_users_routes)
module.exports = auth_usersRouter

