const express = require('express')
const aile_controller=require('../../controllers/administration/aile/aile.controller')
const aile_routes=express.Router()

aile_routes.get('/findAllaile',aile_controller.findAllaile)
aile_routes.get('/findallbatiment',aile_controller.findallbatiment)
aile_routes.get('/findAlluser',aile_controller.findalluser)
aile_routes.post('/createaile',aile_controller.createaile)
aile_routes.get('/finoneaile/:ID_AILE',aile_controller.findOneaile)
aile_routes.post('/deleteaile',aile_controller.deleteItemsaile)
aile_routes.put('/update/:ID_AILE',aile_controller.updateaile)


module.exports = aile_routes



