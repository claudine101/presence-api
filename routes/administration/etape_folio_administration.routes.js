const express = require('express')

const etape_folio__controller=require('../../controllers/administration/etapes_folio/etapes_folio_administration.controller')
const etape_folio_routes=express.Router()


etape_folio_routes.get('/',etape_folio__controller.findAlletape_folio)
etape_folio_routes.get('/etape',etape_folio__controller.findetape)
etape_folio_routes.get('/findone/:ID_ETAPE_FOLIO',etape_folio__controller.findOneetapef0lio)
etape_folio_routes.put('/:ID_ETAPE_FOLIO',etape_folio__controller.updateetapeflio)

module.exports = etape_folio_routes



