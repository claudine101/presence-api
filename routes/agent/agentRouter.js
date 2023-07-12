const express = require('express')
const agent_routes=require('./agent.routes')
const agentRouter=express.Router()

agentRouter.use('/superviseur_archives',agent_routes)
module.exports = agentRouter

