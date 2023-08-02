const express = require('express')

const profil_controller=require('../../controllers/administration/profil/profil.controller')
const profile_routes=express.Router()

profile_routes.post('/createProf',profil_controller.createProfil)
profile_routes.put('/updateProf/:ID_PROFIL',profil_controller.updateProfil)
profile_routes.get('/findAllprof',profil_controller.findAll)
profile_routes.get('/findOne/:ID_PROFIL',profil_controller.findOneUprofile)
profile_routes.post('/deleteprof',profil_controller.deleteItems)

module.exports = profile_routes



