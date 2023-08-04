const express = require('express')

const malle_controller= require('../../controllers/administration/malle/malle_administration.controller')
const malle_routes=express.Router()

malle_routes.post('/',malle_controller.create_malle)
malle_routes.get('/',malle_controller.findAllMalle)
malle_routes.get('/findone/:ID_MAILLE',malle_controller.findOneMalle)
malle_routes.put('/:ID_MAILLE',malle_controller.updateMalle)
malle_routes.post('/deletemalle',malle_controller.deleteItems)


module.exports = malle_routes



