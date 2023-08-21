const express = require('express')

const planification_controller = require("../../controllers/administration/preparationEtiquetage/planification.controller")
const planification_routes=express.Router()

planification_routes.get('/',planification_controller.planification)
planification_routes.get('/liste',planification_controller.desarchivage)
planification_routes.get('/transmission',planification_controller.transmission)
planification_routes.get('/etiquetage',planification_controller.etiquetage)
planification_routes.get('/indexation',planification_controller.indexation)





module.exports = planification_routes



