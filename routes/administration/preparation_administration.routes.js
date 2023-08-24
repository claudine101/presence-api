const express = require('express')

const planification_controller = require("../../controllers/administration/preparationEtiquetage/planification.controller")
const preparation_controller = require("../../controllers/administration/rapportpreparation/preparation.controller")

const planification_routes=express.Router()

/**
 * rapport pour les listes
 * 
 */
planification_routes.get('/',planification_controller.planification)
planification_routes.get('/liste',planification_controller.desarchivage)
planification_routes.get('/transmission',planification_controller.transmission)
planification_routes.get('/etiquetage',planification_controller.etiquetage)
planification_routes.get('/indexation',planification_controller.indexation)


/**
 * routes pour les rapports
 * 
 */

planification_routes.get('/rapport',preparation_controller.find_volume_planifie)
planification_routes.get('/folio_prepare',preparation_controller.find_volume_prepare)
planification_routes.get('/chefplateau',preparation_controller.agent_chefplateau_preparation)
planification_routes.get('/chefequipe',preparation_controller.agent_chefequipe_preparation)
planification_routes.get('/superviseur',preparation_controller.agent_superviseur_preparation)





module.exports = planification_routes



