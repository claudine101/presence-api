const express = require('express')

const indexation_rapport=require('../../controllers/administration/rapport/indexation_rapport.controller')
const indexation_routes=express.Router()

indexation_routes.get('/idexation_rapport',indexation_rapport.get_rapport_indexation)

module.exports = indexation_routes



