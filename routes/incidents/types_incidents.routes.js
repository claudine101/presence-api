const express = require('express')
const types_incidents_controller = require('../../controllers/incidents/types_incidents.controller')
const types_incidents_routes = express.Router()


 /**
 * Une route pour rettourner tous les ordres incidents existants
 *@method GET
 * @url /types/incident/allTypesIncidents
 */
 types_incidents_routes.get('/allTypesIncidents', types_incidents_controller.findAllTypesIncidents)


 
 /**
 * Une route pour retourner tous les types d'incidents par rapport a l'ordre existants
 *@method GET
 * @url /types/incident/allTypesIncidents/parOrder
 */
 types_incidents_routes.get('/allTypesIncidents/parOrder/:ID_ORDRE_INCIDENT', types_incidents_controller.findAllTypesIncidentsByordres)

  /**
 * Une route pour retourner tous les types de problemes lors du choix du logiciel
 *@method GET
 * @url /types/incident/allTypesIncidents/parLogiciel
 */
 types_incidents_routes.get('/allTypesIncidents/parLogiciel', types_incidents_controller.findAllTypesIncidentsChoixLogiciel)

  /**
 * Une route aui permet d'enregistrer une incident
 *@method POST
 * @url /types/incident/allTypesIncidents/declarer
 */
 types_incidents_routes.post('/allTypesIncidents/declarer', types_incidents_controller.createIncidents)





module.exports = types_incidents_routes