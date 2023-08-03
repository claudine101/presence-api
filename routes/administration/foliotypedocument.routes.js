const express = require('express')
const foliotypedocument_controller=require('../../controllers/administration/foliotypedocument/foliotypedocument.controller')
const foliotypedocument_routes=express.Router()

foliotypedocument_routes.post('/createfoliotypedocument',foliotypedocument_controller.createfoliotypedocument)
foliotypedocument_routes.put('/updatefoliotypedocument/:ID_TYPE_FOLIO_DOCUMENT',foliotypedocument_controller.updateFoliotypedocument)
foliotypedocument_routes.get('/findonefoliotypedocumnt/:ID_TYPE_FOLIO_DOCUMENT',foliotypedocument_controller.findOneFoliotypedocument)
foliotypedocument_routes.get('/findAllfoliotypedocument',foliotypedocument_controller.findAllfoliotypedocument)
foliotypedocument_routes.post('/deletefoliotypedocument',foliotypedocument_controller.deleteItems)
foliotypedocument_routes.get('/findAllnaturefolio',foliotypedocument_controller.findallnaturefolio)

module.exports = foliotypedocument_routes



