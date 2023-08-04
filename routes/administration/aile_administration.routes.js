const express = require('express')

const aile__controller=require('../../controllers/administration/aile/aile.controller')
const aile_routes=express.Router()

aile_routes.get('/',aile__controller.findAile)
module.exports = aile_routes



