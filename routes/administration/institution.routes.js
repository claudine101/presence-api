const express = require('express')

const institution_controler=require('../../controllers/administration/institution/institution.controller')
const institution_routes=express.Router()
institution_routes.post('/createInstitution',institution_controler.createInstitution)
institution_routes.post('/deleteInstitution',institution_controler.deleteItems)
institution_routes.get('/findAllInstitution',institution_controler.findAll)
institution_routes.get('/findOneInstutition/:ID_INSTITUTION',institution_controler.findOneInstitution)
institution_routes.put('/updateInstitution/:ID_INSTITUTION',institution_controler.updateInstitution)

module.exports = institution_routes



