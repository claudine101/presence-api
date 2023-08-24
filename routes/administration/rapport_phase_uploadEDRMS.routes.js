const express = require('express')
const upload_EDRMS= require('../../controllers/administration/rapport_edrms/Rapport_phase_uploadEDRMS')
const uploadEDRMS_routes=express.Router()

uploadEDRMS_routes.get('/',upload_EDRMS.phaseUpload)
uploadEDRMS_routes.get('/getall_dossierAgent',upload_EDRMS.performance_agentupload)
uploadEDRMS_routes.get('/verificateur',upload_EDRMS.verificateur_alldossier)
uploadEDRMS_routes.get('/chefequipe',upload_EDRMS.chefequipe_alldossier)

module.exports = uploadEDRMS_routes
