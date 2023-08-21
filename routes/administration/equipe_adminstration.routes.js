const express = require('express')

const equipe_controller=require('../../controllers/administration/equipe/equipe_administration.controller')
const equipe_routes=express.Router()

equipe_routes.post('/',equipe_controller.createequipe)
equipe_routes.get('/',equipe_controller.findAllequipe)
equipe_routes.get('/findone/:ID_EQUIPE',equipe_controller.findOneequipe)
equipe_routes.put('/:ID_EQUIPE',equipe_controller.updateequipe)
equipe_routes.post('/deleteequipe',equipe_controller.deleteItems)
equipe_routes.get('/Alluser',equipe_controller.findalluser)

module.exports = equipe_routes



