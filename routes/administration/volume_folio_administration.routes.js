const express = require('express')

const volume_folio__controller=require('../../controllers/administration/volume_folio/volume_administration.controller')
const volume_folio_routes=express.Router()


volume_folio_routes.get('/',volume_folio__controller.findAllvolume_folio)
volume_folio_routes.get('/findone/:ID_ETAPE_VOLUME',volume_folio__controller.findOnevolumef0lio)
volume_folio_routes.put('/:ID_ETAPE_VOLUME',volume_folio__controller.updatevolumeflio)

module.exports = volume_folio_routes



