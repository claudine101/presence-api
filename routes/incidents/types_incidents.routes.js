const express = require('express')
const types_incidents_controller = require('../../controllers/incidents/types_incidents.controller')
const types_incidents_routes = express.Router()


 /**
 * Une route pour rettourner tous les types d'incidents existants
 *@method GET
 * @url /types/incident/allTypesIncidents
 */
 types_incidents_routes.get('/allTypesIncidents', types_incidents_controller.findAllTypesIncidents)

  /**
 * Une route aui permet d'enregistrer une incident
 *@method POST
 * @url /types/incident/allTypesIncidents/declarer
 */
 types_incidents_routes.post('/allTypesIncidents/declarer', types_incidents_controller.createIncidents)





module.exports = types_incidents_routes