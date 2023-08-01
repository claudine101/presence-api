const express = require('express')

const useraile_controller=require('../../controllers/administration/useraile/useraile.controller')
const useraile_routes=express.Router()

useraile_routes.post('/createuseraile',useraile_controller.createuseraile)
useraile_routes.get('/findAllaile',useraile_controller.findaile)
useraile_routes.get('/findAlluseraile',useraile_controller.findAlluseraile)
useraile_routes.get('/finAlluser',useraile_controller.findalluser)


module.exports = useraile_routes

