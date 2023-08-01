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
 * Une route  permet  recupere les nature du folio
 *@method GET
 * @url /preparation/volume/nature
 */
 preparation_volume_routes.get('/nature', preparation_volume_controller.findNature)

 /**
 * Une route  permet  recupere les nature du folio
 *@method GET
 * @url /preparation/volume/count
 */
 preparation_volume_routes.get('/count/:ID_VOLUME', preparation_volume_controller.findCount)

 /**
 * Une route  permet  de nommer  agent superviseur  archive
 *@method PUT
 * @url /preparation/volume/modifier
 */
 preparation_volume_routes.put('/modifier/:ID_VOLUME', preparation_volume_controller.updateVolume)

 /**
 * Une route  permet  de nommer  agent distributeur
 *@method PUT
 * @url /preparation/volume/nommerDistributeur
 */
 preparation_volume_routes.put('/nommerDistributeur/:ID_VOLUME', preparation_volume_controller.nommerDistributeur)

 /**
 * Une route  permet  de nommer  agent superviseur aile
 *@method PUT
 * @url /preparation/volume/nommerSuperviseurAile
 */
 preparation_volume_routes.put('/nommerSuperviseurAile/:ID_VOLUME', preparation_volume_controller.nommerSuperviseurAile)

  /**
 * Une route  permet  de nommer  chef plateau
 *@method PUT
 * @url /preparation/volume/nommerChefPlateau
 */
 preparation_volume_routes.put('/nommerChefPlateau/:ID_VOLUME', preparation_volume_controller.nommerChefPlateau)

module.exports = preparation_volume_routes
