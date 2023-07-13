const express = require('express')
const agent_controller = require('../../controllers/agent/agent.controller')
const agent_routes = express.Router()

/**
 * Une route pour recupere Agents superviseur archives
 *@method POST
 * @url /agent/superviseur_archives/
 */
agent_routes.get('/', agent_controller.findAll)


module.exports = agent_routes