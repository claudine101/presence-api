const express = require('express')

const rapport_phase_scanning_controler=require('../../controllers/administration/rapport/phase_scanning.controller')
const rapport_phase_scanning_routes=express.Router()

rapport_phase_scanning_routes.get('/dossier_scanne_non_scanner/:ID_FOLIO_EQUIPE',rapport_phase_scanning_controler.dossiers_scannes_non_scannees)

rapport_phase_scanning_routes.get('/allequipe',rapport_phase_scanning_controler.equipesAll)

module.exports = rapport_phase_scanning_routes



