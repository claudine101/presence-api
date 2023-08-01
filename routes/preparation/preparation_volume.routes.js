const express = require('express')
const preparation_volume_controller = require('../../controllers/preparation/preparation_volume_controller')
const preparation_volume_routes = express.Router()

/**
 * Une route  permet  un chef  de divisions des archives d'ajouter   les volumes 
 *@method POST
 * @url /preparation/volume
 */
 preparation_volume_routes.post('/', preparation_volume_controller.createVolume)

 /**
 * Une route  permet  recupere les volumes
 *@method POST
 * @url /preparation/volume
 */
 preparation_volume_routes.get('/', preparation_volume_controller.findAll)

 /**
 * Une route  permet  de nommer  agent superviseur  archive
 *@method PUT
 * @url /preparation/volume/modifier
 */
 preparation_volume_routes.put('/modifier/:ID_VOLUME', preparation_volume_controller.updateVolume)

module.exports = preparation_volume_routes
