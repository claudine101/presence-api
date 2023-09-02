const express = require('express')


const types_incident_controller = require("../../controllers/administration/incident/types_incident.controller")
const incident_controller = require("../../controllers/administration/incident/incident.controller")


const typesincident_routes = express.Router()

typesincident_routes.post('/',types_incident_controller.createtypes_incident)

typesincident_routes.get('/allincident',incident_controller.findAllincident)
typesincident_routes.put('/traitement_incident/:ID_INCIDENT',incident_controller.reception)
typesincident_routes.put('/traitement',incident_controller.traitement)




typesincident_routes.get('/',types_incident_controller.findAlltype)
typesincident_routes.get('/allordre',types_incident_controller.allordre)
typesincident_routes.post('/delete',types_incident_controller.deleteypeincident)
typesincident_routes.get('/:ID_TYPE_INCIDENT',types_incident_controller.findOnetype)
typesincident_routes.put('/update/:ID_TYPE_INCIDENT',types_incident_controller.Updatetypeincident)





module.exports = typesincident_routes



