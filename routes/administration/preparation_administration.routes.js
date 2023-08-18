const express = require('express')

const phase_controller=require('../../controllers/administration/phases/phases_administration.controller')
const planification_controller = require("../../controllers/administration/preparationEtiquetage/planification.controller")
const planification_routes=express.Router()

planification_routes.get('/',planification_controller.planification)
planification_routes.get('/liste',planification_controller.desarchivage)
planification_routes.get('/transmission',planification_controller.transmission)
planification_routes.get('/etiquetage',planification_controller.etiquetage)





module.exports = planification_routes



