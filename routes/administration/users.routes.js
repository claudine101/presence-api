const express = require('express')

const utilisateurs_controller=require('../../controllers/administration/utilisateurs/utilisateurs.controller')
const utilisateurs_routes=express.Router()

utilisateurs_routes.post('/createuser',utilisateurs_controller.createuser)
utilisateurs_routes.put('/updateUser/:USERS_ID',utilisateurs_controller.Updateuser)
utilisateurs_routes.get('/alluser',utilisateurs_controller.findAlluser)
utilisateurs_routes.get('/oneuser/:USERS_ID',utilisateurs_controller.findOneuser)
utilisateurs_routes.post('/deleteuser',utilisateurs_controller.deleteItemsuser)
utilisateurs_routes.get('/profile',utilisateurs_controller.listeprofiles)
utilisateurs_routes.put('/activation/:USERS_ID',utilisateurs_controller.activer_descativer_utilisateur)
utilisateurs_routes.post('/login/',utilisateurs_controller.login)
utilisateurs_routes.get('/institution/',utilisateurs_controller.listeInstitutions)

module.exports = utilisateurs_routes



