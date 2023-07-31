const express = require('express')
const scanning_volume_routes=require('./scanning_volume.routes')
const scanning_volumeRouter=express.Router()

scanning_volumeRouter.use('/volume',scanning_volume_routes)
module.exports = scanning_volumeRouter

