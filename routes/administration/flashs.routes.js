const express = require('express')

const flashs_controller=require('../../controllers/administration/flashs/flashs.controller')
const flash_routes=express.Router()

flash_routes.post('/createflash',flashs_controller.createflashs)
flash_routes.put('/updateflash/:ID_FLASH',flashs_controller.updateflash)
flash_routes.get('/findallflash',flashs_controller.findAllflash)
flash_routes.get('/findoneflash/:ID_FLASH',flashs_controller.findOneFlash)
flash_routes.post('/deleteflash',flashs_controller.deleteItems)

module.exports = flash_routes



