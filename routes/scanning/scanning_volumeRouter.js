const express = require('express')
const scanning_volume_routes=require('./scanning_volume.routes')
const scanning_folio_routes=require('./scanning_folio.routes')
const scanning_volumeRouter=express.Router()

scanning_volumeRouter.use('/volume',scanning_volume_routes)
scanning_volumeRouter.use('/folio',scanning_folio_routes)
module.exports = scanning_volumeRouter

