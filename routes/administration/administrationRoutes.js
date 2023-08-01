const express = require('express')
const user_routes=require('./users.routes')
const profile_routes=require('./profil.routes')
const useraile_routes=require('./useraile.routes')

const administrationRouter=express.Router()
administrationRouter.use('/users',user_routes)
administrationRouter.use('/profil',profile_routes)
administrationRouter.use('/useraile',useraile_routes)

module.exports = administrationRouter

