const express = require('express')
const volume_routes=require('./volume.routes')
const volumeRouter=express.Router()
volumeRouter.use('/dossiers',volume_routes)
module.exports = volumeRouter

