const express = require('express')

const dashboard_controller = require("../../controllers/administration/dashborad/dashboard.controller")


const dashboard_routes = express.Router()

dashboard_routes.get('/countAndProgression',dashboard_controller.countAndProgressionActivity)
dashboard_routes.get('/rapportByphase',dashboard_controller.rapportByphase)


module.exports = dashboard_routes



