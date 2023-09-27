const express = require('express')

const rapport_phase_scanning_controler=require('../../controllers/administration/rapport/phase_scanning.controller')
const rapport_phase_scanning_routes=express.Router()

rapport_phase_scanning_routes.get('/phasescanning',rapport_phase_scanning_controler.phaseScanning)
rapport_phase_scanning_routes.get('/agentdesarchivages',rapport_phase_scanning_controler.rapport_agent_desarchivage)
rapport_phase_scanning_routes.get('/agentsuperviseur',rapport_phase_scanning_controler.agent_superviseur)
rapport_phase_scanning_routes.get('/chefplateau',rapport_phase_scanning_controler.agent_chefplateau)
rapport_phase_scanning_routes.get('/chefequipe',rapport_phase_scanning_controler.agent_chefequipe)
module.exports = rapport_phase_scanning_routes



