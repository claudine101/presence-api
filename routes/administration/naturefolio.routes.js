const express = require('express')

const naturefolio_controller=require('../../controllers/administration/naturefolio/naturefolio.controller')
const naturefolio_routes=express.Router()

naturefolio_routes.post('/createnaturefolio',naturefolio_controller.createnaturefolio)
naturefolio_routes.put('/updatenaturefolio/:ID_NATURE_FOLIO',naturefolio_controller.updateNaturefolio)
naturefolio_routes.get('/findone/:ID_NATURE_FOLIO',naturefolio_controller.findOneNaturefolio)
naturefolio_routes.get('/findAllnaturefolio',naturefolio_controller.findAllnaturefolio)
naturefolio_routes.post('/deletenaturefolio',naturefolio_controller.deleteItems)

module.exports = naturefolio_routes



