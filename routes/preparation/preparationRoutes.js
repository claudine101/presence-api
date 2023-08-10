
const express = require('express')
const preparation_volume_routes=require('./preparation_volume.routes')
const preparation_batiment_routes = require('./preparation_batiment.routes')
const preparation_folio_routes = require('./preparation_folio.routes')
// const preparation_folio_routes = require('./preparation_folio.routes')
const preparation_volumeRoutes=express.Router()
preparation_volumeRoutes.use('/volume',preparation_volume_routes)
preparation_volumeRoutes.use('/batiment',preparation_batiment_routes)
preparation_volumeRoutes.use('/folio',preparation_folio_routes)
module.exports = preparation_volumeRoutes