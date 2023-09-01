const express = require('express')

const ordre_incident_controller = require("../../controllers/administration/incident/ordre_incident.controller")



const ordreincident_routes = express.Router()

ordreincident_routes.post('/',ordre_incident_controller.createordre_incident)
ordreincident_routes.get('/edit/:ID_ORDRE_INCIDENT',ordre_incident_controller.findOneOrdre)
ordreincident_routes.get('/ordre',ordre_incident_controller.findAllordre)
ordreincident_routes.put('/updateOrdre/:ID_ORDRE_INCIDENT',ordre_incident_controller.Updateordreincident)
ordreincident_routes.post('/delete',ordre_incident_controller.deleteOrdreincident)






module.exports = ordreincident_routes



