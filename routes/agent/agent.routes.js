const express = require('express')
const agent_controller = require('../../controllers/agent/agent.controller')
const agent_routes = express.Router()

/**
 * Une route pour controller la connnexion d'un client
 *@method POST
 * @url /auth/users/login
 */
agent_routes.get('/', agent_controller.findAll)


module.exports = agent_routes