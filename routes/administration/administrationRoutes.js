const express = require('express')
const user_routes=require('./users.routes')
const profile_routes=require('./profil.routes')
const useraile_routes=require('./useraile.routes')
const naturefolio_routes=require('./naturefolio.routes')
const foliotypedocument_routes=require('./foliotypedocument.routes')
const flash_routes=require('./flashs.routes')

const administrationRouter=express.Router()
administrationRouter.use('/users',user_routes)
administrationRouter.use('/profil',profile_routes)
administrationRouter.use('/useraile',useraile_routes)
administrationRouter.use('/naturefolio',naturefolio_routes)
administrationRouter.use('/foliotypedocument',foliotypedocument_routes)
administrationRouter.use('/flashs',flash_routes)

module.exports = administrationRouter

