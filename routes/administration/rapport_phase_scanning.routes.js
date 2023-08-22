const express = require('express')

const rapport_phase_scanning_controler=require('../../controllers/administration/rapport/phase_scanning.controller')
const rapport_phase_scanning_routes=express.Router()

rapport_phase_scanning_routes.get('/phasescanning',rapport_phase_scanning_controler.phaseScanning)

module.exports = rapport_phase_scanning_routes



