const express = require('express')
const auth_users_controller = require('../../controllers/auth/auth_users.controller')
const auth_users_routes = express.Router()

/**
 * Une route pour controller la connnexion d'un client
 *@method POST
 * @url /auth/users/login
 */
auth_users_routes.post('/login', auth_users_controller.login)

auth_users_routes.get('/presences', auth_users_controller.findUsers)


module.exports = auth_users_routes