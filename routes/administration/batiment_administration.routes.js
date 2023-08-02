const express = require('express')

const numerpbatiment_controller=require('../../controllers/administration/batiment/batiment_admnistration.controller')
const numbatiment_routes=express.Router()

numbatiment_routes.post('/',numerpbatiment_controller.createnumerobatiment)
numbatiment_routes.get('/',numerpbatiment_controller.findAllnumero)
numbatiment_routes.get('/findone/:ID_BATIMENT',numerpbatiment_controller.findOneNUMERO)
numbatiment_routes.put('/:ID_BATIMENT',numerpbatiment_controller.updateNUMERO)
numbatiment_routes.post('/deletebatiment',numerpbatiment_controller.deleteItems)


module.exports = numbatiment_routes



