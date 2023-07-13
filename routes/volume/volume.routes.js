const express = require('express')
const volume_controller = require('../../controllers/volume/volume.controller')
const volume_routes = express.Router()
/**
 * Une route  recuperer  les volumes d'un chef  de divisions des archives
 *@method GET
 * @url /volume/dossiers/volume
 */
volume_routes.get('/myVolume', volume_controller.findById)
/**
 * Une route  recuperer  les volumes d'un agent  superviseurs archives
 *@method GET
 * @url /volume/dossiers/volume
 */
 volume_routes.get('/volume', volume_controller.findById)
/**
 * Une route  recuperer  les volumes d'un chef  de divisions des archives
 *@method GET
 * @url /volume/dossiers/volume
 */
 volume_routes.get('/volumeOne/:ID_VOLUME', volume_controller.findOne)
 /**
 * Une route  recuperer  les pv  
 *@method GET
 * @url /volume/dossiers/volume
 */
 volume_routes.get('/pv', volume_controller.getPv)
/**
 * Une route  recuperer  tous les volumes
 *@method GET
 * @url /volume/dossiers/volumes
 */
 volume_routes.get('/volumes', volume_controller.findAll)
/**
 * Une route  permet  un chef  de divisions des archives d'ajouter   les volumes 
 *@method POST
 * @url /volume/dossiers/mofidier
 */
 volume_routes.put('/mofidier/:ID_VOLUME', volume_controller.update)
/**
 * Une route  permet  un chef  de divisions des archives d'ajouter   les volumes 
 *@method POST
 * @url /volume/dossiers
 */
volume_routes.post('/', volume_controller.createVolume)

module.exports = volume_routes