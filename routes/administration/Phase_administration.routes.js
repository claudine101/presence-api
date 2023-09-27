const express = require('express')

const phase__controller=require('../../controllers/administration/phases/phases_administration.controller')
const phase_routes=express.Router()

phase_routes.get('/',phase__controller.findAllphase)

module.exports = phase_routes



